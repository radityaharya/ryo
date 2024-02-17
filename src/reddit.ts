/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchRedditData(subreddit: string) {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.json`,
    {
      headers: {
        'User-Agent': 'discord-cloudfare-bot',
      },
    },
  );

  if (!response.ok) {
    let errorText = `Error fetching ${response.url}: ${response.status} ${response.statusText}`;
    try {
      const error = await response.text();
      if (error) {
        errorText = `${errorText} \n\n ${error}`;
      }
    } catch {
      console.error('Error parsing error response');
    }
    throw new Error(errorText);
  }

  return await response.json();
}

function extractUrlFromPost(post: {
  is_gallery: any;
  data: {
    media: { reddit_video: { fallback_url: any } };
    secure_media: { reddit_video: { fallback_url: any } };
    url: any;
  };
}) {
  if (post.is_gallery) {
    return '';
  }
  return (
    post.data?.media?.reddit_video?.fallback_url ||
    post.data?.secure_media?.reddit_video?.fallback_url ||
    post.data?.url
  );
}

export async function getRedditUrl(subreddit: string) {
  const data = (await fetchRedditData(subreddit)) as any;
  const posts = data.data.children
    .map(extractUrlFromPost)
    .filter((post: any) => !!post);

  const randomIndex = Math.floor(Math.random() * posts.length);
  const randomPost = posts[randomIndex];
  return randomPost;
}
