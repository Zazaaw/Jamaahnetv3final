import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    console.log('Authorization error while verifying user:', error);
    return null;
  }
  return user;
}

// GET /api/timeline - Get all timeline posts
app.get('/', async (c) => {
  try {
    const posts = await kv.getByPrefix('timeline:');
    
    // Sort by created_at descending
    const sortedPosts = posts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json(sortedPosts);
  } catch (error) {
    console.log('Error fetching timeline posts:', error);
    return c.json({ error: 'Failed to fetch timeline posts' }, 500);
  }
});

// GET /api/timeline/:id - Get single post
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    // Handle both formats: with or without 'timeline:' prefix
    const fullId = id.startsWith('timeline:') ? id : `timeline:${id}`;
    const post = await kv.get(fullId);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json(post);
  } catch (error) {
    console.log('Error fetching timeline post:', error);
    return c.json({ error: 'Failed to fetch timeline post' }, 500);
  }
});

// POST /api/timeline - Create new post (requires auth)
app.post('/', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { title, content, image } = body;

    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400);
    }

    // Get user profile for name
    const profile = await kv.get(`profile:${user.id}`);
    const userName = profile?.name || user.email?.split('@')[0] || 'Anonymous';

    const postId = `${Date.now()}_${user.id}`;
    const newPost = {
      id: postId,
      title,
      content,
      image: image || null,
      user_id: user.id,
      user_name: userName,
      created_at: new Date().toISOString(),
      likes: [],
      comments: [],
    };

    await kv.set(`timeline:${postId}`, newPost);

    return c.json(newPost, 201);
  } catch (error) {
    console.log('Error creating timeline post:', error);
    return c.json({ error: 'Failed to create timeline post' }, 500);
  }
});

// PUT /api/timeline/:id - Update post (requires auth & ownership)
app.put('/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const fullId = id.startsWith('timeline:') ? id : `timeline:${id}`;
    const post = await kv.get(fullId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.user_id !== user.id) {
      return c.json({ error: 'Forbidden: You can only edit your own posts' }, 403);
    }

    const body = await c.req.json();
    const { title, content, image } = body;

    const updatedPost = {
      ...post,
      title: title || post.title,
      content: content || post.content,
      image: image !== undefined ? image : post.image,
      updated_at: new Date().toISOString(),
    };

    await kv.set(fullId, updatedPost);

    return c.json(updatedPost);
  } catch (error) {
    console.log('Error updating timeline post:', error);
    return c.json({ error: 'Failed to update timeline post' }, 500);
  }
});

// DELETE /api/timeline/:id - Delete post (requires auth & ownership)
app.delete('/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const fullId = id.startsWith('timeline:') ? id : `timeline:${id}`;
    const post = await kv.get(fullId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.user_id !== user.id) {
      return c.json({ error: 'Forbidden: You can only delete your own posts' }, 403);
    }

    await kv.del(fullId);

    return c.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.log('Error deleting timeline post:', error);
    return c.json({ error: 'Failed to delete timeline post' }, 500);
  }
});

// POST /api/timeline/:id/like - Like/Unlike post (requires auth)
app.post('/:id/like', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const fullId = id.startsWith('timeline:') ? id : `timeline:${id}`;
    const post = await kv.get(fullId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    let likes = post.likes || [];
    
    if (likes.includes(user.id)) {
      // Unlike
      likes = likes.filter((userId: string) => userId !== user.id);
    } else {
      // Like
      likes.push(user.id);
    }

    const updatedPost = {
      ...post,
      likes,
    };

    await kv.set(fullId, updatedPost);

    return c.json({ likes, isLiked: likes.includes(user.id) });
  } catch (error) {
    console.log('Error toggling like on timeline post:', error);
    return c.json({ error: 'Failed to toggle like' }, 500);
  }
});

// POST /api/timeline/:id/comment - Add comment (requires auth)
app.post('/:id/comment', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const fullId = id.startsWith('timeline:') ? id : `timeline:${id}`;
    const post = await kv.get(fullId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const body = await c.req.json();
    const { text } = body;

    if (!text) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    // Get user profile for name
    const profile = await kv.get(`profile:${user.id}`);
    const userName = profile?.name || user.email?.split('@')[0] || 'Anonymous';

    const comment = {
      id: `${Date.now()}_${user.id}`,
      user_id: user.id,
      user_name: userName,
      text,
      created_at: new Date().toISOString(),
    };

    const comments = [...(post.comments || []), comment];

    const updatedPost = {
      ...post,
      comments,
    };

    await kv.set(fullId, updatedPost);

    return c.json(comment, 201);
  } catch (error) {
    console.log('Error adding comment to timeline post:', error);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// DELETE /api/timeline/:postId/comment/:commentId - Delete comment (requires auth & ownership)
app.delete('/:postId/comment/:commentId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const fullPostId = postId.startsWith('timeline:') ? postId : `timeline:${postId}`;
    const commentId = c.req.param('commentId');
    
    const post = await kv.get(fullPostId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const comment = post.comments?.find((c: any) => c.id === commentId);
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    if (comment.user_id !== user.id && post.user_id !== user.id) {
      return c.json({ error: 'Forbidden: You can only delete your own comments or comments on your posts' }, 403);
    }

    const updatedComments = post.comments.filter((c: any) => c.id !== commentId);

    const updatedPost = {
      ...post,
      comments: updatedComments,
    };

    await kv.set(fullPostId, updatedPost);

    return c.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.log('Error deleting comment from timeline post:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

// GET /api/timeline/user/:userId - Get posts by specific user
app.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const allPosts = await kv.getByPrefix('timeline:');
    
    const userPosts = allPosts.filter((post: any) => post.user_id === userId);
    
    // Sort by created_at descending
    const sortedPosts = userPosts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json(sortedPosts);
  } catch (error) {
    console.log('Error fetching user timeline posts:', error);
    return c.json({ error: 'Failed to fetch user timeline posts' }, 500);
  }
});

// POST /api/timeline/:id/bookmark - Bookmark/Unbookmark post (requires auth)
app.post('/:id/bookmark', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const postId = id.startsWith('timeline:') ? id.replace('timeline:', '') : id;
    
    // Check if post exists
    const post = await kv.get(`timeline:${postId}`);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Get user's bookmarks
    const bookmarksKey = `bookmarks:${user.id}`;
    let bookmarks = await kv.get(bookmarksKey) || [];
    
    if (bookmarks.includes(postId)) {
      // Remove bookmark
      bookmarks = bookmarks.filter((bid: string) => bid !== postId);
    } else {
      // Add bookmark
      bookmarks.push(postId);
    }

    await kv.set(bookmarksKey, bookmarks);

    return c.json({ bookmarks, isBookmarked: bookmarks.includes(postId) });
  } catch (error) {
    console.log('Error toggling bookmark on timeline post:', error);
    return c.json({ error: 'Failed to toggle bookmark' }, 500);
  }
});

// GET /api/timeline/bookmarks - Get user's bookmarked posts (requires auth)
app.get('/bookmarks/list', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's bookmarks
    const bookmarksKey = `bookmarks:${user.id}`;
    const bookmarkIds = await kv.get(bookmarksKey) || [];
    
    // Fetch all bookmarked posts
    const bookmarkedPosts = [];
    for (const postId of bookmarkIds) {
      const post = await kv.get(`timeline:${postId}`);
      if (post) {
        bookmarkedPosts.push(post);
      }
    }
    
    // Sort by created_at descending
    const sortedPosts = bookmarkedPosts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json(sortedPosts);
  } catch (error) {
    console.log('Error fetching bookmarked timeline posts:', error);
    return c.json({ error: 'Failed to fetch bookmarked timeline posts' }, 500);
  }
});

export default app;