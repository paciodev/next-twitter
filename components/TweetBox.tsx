import {
  CalendarIcon,
  EmojiHappyIcon,
  LocationMarkerIcon,
  PhotographIcon,
  SearchCircleIcon
} from '@heroicons/react/outline'
import { useSession } from 'next-auth/react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Tweet, TweetBody } from '../typings';
import { fetchTweets } from '../utils/fetchTweets';

interface Props {
  setTweets: Dispatch<SetStateAction<Tweet[]>>
}

const TweetBox = ({ setTweets }: Props) => {
  const { data: session } = useSession();
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [imageUrlBoxIsOpen, setImageUrlBoxIsOpen] = useState<boolean>(false);

  const addImageToTweet = ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    
    if (!imageInputRef.current?.value) return;

    setImage(imageInputRef.current.value);
    imageInputRef.current.value = ''
    setImageUrlBoxIsOpen(false)

    toast.success('Image added!')
  })

  const deleteImageFromPost = () => {
    setImage('')
    toast.success('Image deleted!')
  }

  const postTweet = async () => {
    const postToast = toast.loading("Posting tweet...", {
      icon: '🚀'
    });
    
    const tweetBody: TweetBody = {
      test: input,
      username: session?.user?.name || 'Unknown user',
      profileImg: session?.user?.image || 'https://links.papareact.com/gll',
      image: image,
    }

    const result = await fetch(`/api/addTweet`, {
      body: JSON.stringify(tweetBody),
      method: 'POST',
    })

    const json = await result.json();

    const newTweets = await fetchTweets();
    setTweets(newTweets);

    toast.success('Tweet posted!', {
      id: postToast
    })

    return json
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    postTweet();

    setInput('')
    setImage('')
    setImageUrlBoxIsOpen(false)
  }

  return (
    <div className='flex space-x-2 p-5'>
      <img className="h-14 w-14 object-cover rounded-full mt-4" src={session?.user?.image ? session.user.image : `https://links.papareact.com/gll`} alt="" />
      <div className='flex flex-1 items-center pl-2'>
        <form className='flex flex-1 flex-col'>
          <input
          type="text"
          placeholder="What's poppin?"
          className="h-24 w-full text-xl outline-none placeholder:text-xl"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center">
            <div className='flex flex-1 flex-row-reverse sm:flex-row space-x-2 text-twitter'>
              <PhotographIcon
                onClick={() => setImageUrlBoxIsOpen(prev => !prev)}
                className='h-8 w-8 mr-3 sm:mr-0 sm:h-5 sm:w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150'
              />
              <SearchCircleIcon className='hidden sm:inline-flex h-5 w-5' />
              <EmojiHappyIcon className='hidden sm:inline-flex h-5 w-5' />
              <CalendarIcon className='hidden sm:inline-flex h-5 w-5' />
              <LocationMarkerIcon className='hidden sm:inline-flex h-5 w-5' />
            </div>
            <button
              disabled={!input || !session}
              className='bg-twitter text-white px-5 py-2 font-bold rounded-full disabled:opacity-40 transition-opacity'
              onClick={handleSubmit}
              >Tweet</button>
          </div>
          {imageUrlBoxIsOpen && (
            <form className='mt-5 flex rounded-lg bg-twitter/80 py-2 px-4'>
              <input
                className='flex-1 bg-transparent p-2 text-white outline-none placeholder:text-white'
                type="text"
                placeholder='Enter Image URL...'
                ref={imageInputRef}
              />
              <button
                className='font-bold text-white'
                type='submit'
                onClick={addImageToTweet}
              >Add Image</button>
            </form> 
          )}

          {image && (
            <div>
              <img className='mt-10 h-40 w-full rounded-xl object-contain shadow-lg' src={image} alt="" />
              <p className='text-red-600 font-semibold text-center cursor-pointer' onClick={deleteImageFromPost}>Delete image from post</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default TweetBox;