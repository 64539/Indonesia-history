import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { z } from 'zod'

const contentDirectory = path.join(process.cwd(), 'src/content/materi')

// Define the schema for frontmatter
const FrontmatterSchema = z.object({
  title: z.string(),
  grade: z.coerce.number().int().min(10).max(12), // Ensure grade is a number and within range
  videoUrl: z.string().url(),
})

export type Frontmatter = z.infer<typeof FrontmatterSchema>

export interface Materi {
  slug: string
  frontmatter: Frontmatter
  content: string
}

export function getMateriBySlug(slug: string): Materi | null {
  // Prevent directory traversal
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '')
  const fullPath = path.join(contentDirectory, `${safeSlug}.mdx`)
  
  try {
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // Validate frontmatter
    const parsedFrontmatter = FrontmatterSchema.safeParse(data)

    if (!parsedFrontmatter.success) {
      console.error(`Invalid frontmatter for slug: ${slug}`, parsedFrontmatter.error)
      return null
    }

    return {
      slug: safeSlug,
      frontmatter: parsedFrontmatter.data,
      content,
    }
  } catch (error) {
    console.error(`Error reading MDX file for slug: ${slug}`, error)
    return null
  }
}

export function getAllMateri(): Materi[] {
  if (!fs.existsSync(contentDirectory)) return []
  
  try {
    const fileNames = fs.readdirSync(contentDirectory)
    const allMateri = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '')
        return getMateriBySlug(slug)
      })
      .filter((materi): materi is Materi => materi !== null)
      
    return allMateri
  } catch (error) {
    console.error("Error reading content directory", error)
    return []
  }
}
