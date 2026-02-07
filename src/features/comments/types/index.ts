// Comment feature types

export interface Comment {
  id: string
  author: string
  createdAt: string
  text: string
}

export interface CommentThread {
  id: string
  x: number // world coordinate
  y: number // world coordinate
  resolved: boolean
  createdAt: string
  createdBy: string
  comments: Comment[]
}
