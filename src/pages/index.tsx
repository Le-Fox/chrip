import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime)


const CreatePostWizard = () => {
  const {user}= useUser();
  const [input,setInput] =useState<string>("")
  const ctx = api.useContext()

  const {mutate,isLoading: isPosting} = api.posts.create.useMutation({
    onSuccess:() => {
      setInput("");
       void ctx.posts.getAll.invalidate()

    }
  });
 
  if (!user) return null;
  return <div className="flex gap-3 w-full">
    <Image src={user.profileImageUrl} alt={"Profile image"} className="w-14 h-14 rounded-full" width={56} height={56}/>
    <input placeholder="Type some emojis!" className="bg-transparent grow outline-none" type="text" value={input} onChange={(e) => setInput(e.target.value)}  disabled={isPosting} />
    <button onClick={() => mutate({content:input})}> Post </button>
  </div>
}



type PostWithUser= RouterOutputs['posts']['getAll'][number]
const PostView = (props:PostWithUser) => {

  const {post,author} = props
  return (
    <div key = {post.id} className=" gap-3 border-b border-slate-400 p-4 flex"> 
      <Image src={author?.profilePicture} className="w-14 h-14 rounded-full" width={56} height={56} alt={`@${author.username}'s profile picture`}/>
      <div className="flex flex-col">
        <div className="flex text-slate-300 font-bold gap-1">
          <span> {`@${author.username}`}</span>
          <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-2xl"> {post.content}</span>
      </div>    
    </div>
  )

}

const Feed = () =>{
  const {data, isLoading:postsLoading} = api.posts.getAll.useQuery();


  if(postsLoading) return <LoadingPage/>
  if(!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
            {data.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id}/>
           ))}
          </div>
  )
}

const Home: NextPage = () => { 
  
  const {isLoaded:userLoaded,isSignedIn} = useUser()
  api.posts.getAll.useQuery();

  if(!userLoaded) return <div/>



  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className=" border-slate-200 w-full md:max-w-2xl border-x">
          <div className="border-b border-slate-400 p-4">
            {!isSignedIn &&
             <div className="flex justify-center">
              <SignInButton/>
             </div>}
            {isSignedIn && <CreatePostWizard/>}
          </div>
          <Feed/>
        </div>
      </main>
    </>
  );
};

export default Home;
