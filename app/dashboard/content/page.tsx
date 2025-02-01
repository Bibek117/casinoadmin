"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"

// Mock data - replace with actual API calls
const initialPosts = [
  {
    id: "1",
    title: "Getting Started with Next.js",
    excerpt: "Learn how to build modern web applications with Next.js",
    status: "Published",
    date: "2024-03-15"
  },
  {
    id: "2",
    title: "Understanding TypeScript",
    excerpt: "A comprehensive guide to TypeScript fundamentals",
    status: "Draft",
    date: "2024-03-14"
  },
  {
    id: "3",
    title: "Mastering Tailwind CSS",
    excerpt: "Tips and tricks for using Tailwind CSS effectively",
    status: "Published",
    date: "2024-03-13"
  }
]

export default function ContentPage() {
  const [posts, setPosts] = useState(initialPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: ""
  })

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreatePost = () => {
    const post = {
      id: String(posts.length + 1),
      title: newPost.title,
      excerpt: newPost.excerpt,
      status: "Draft",
      date: new Date().toISOString().split("T")[0]
    }
    setPosts([post, ...posts])
    setNewPost({ title: "", content: "", excerpt: "" })
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  return (
    <Tabs defaultValue="posts" className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="posts" className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    post.status === "Published"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                  }`}>
                    {post.status}
                  </div>
                  <div className="text-sm text-muted-foreground">{post.date}</div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPost(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="create" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>Create a new blog post or article.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Enter post title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={newPost.excerpt}
                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                placeholder="Enter post excerpt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Write your post content here..."
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={handleCreatePost} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}