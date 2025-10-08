import { defineEventHandler, getQuery, isMethod, readBody } from 'h3'
import type { BlogPost } from '#gel/interfaces'

export default defineEventHandler(async (req) => {
  const { insertBlogPost, allBlogPosts, deleteBlogPost, getBlogPost } = useGelQueries(req)
  const query = getQuery(req)
  const id = query?.id as string | undefined

  if (isMethod(req, 'POST')) {
    const body = await readBody(req)
    const { title, description, content } = body

    const blogPost = await insertBlogPost({
      blogpost_title: title,
      blogpost_description: description,
      blogpost_content: content,
    })

    return blogPost
  }

  if (isMethod(req, 'GET')) {
    if (id) {
      const blogpost = await getBlogPost({ blogpost_id: id })
      return blogpost as BlogPost
    }

    try {
      return await allBlogPosts()
    }
    catch {
      return []
    }
  }

  if (isMethod(req, 'DELETE') && id) {
    await deleteBlogPost({ blogpost_id: id })
    return { deleted: id }
  }
})
