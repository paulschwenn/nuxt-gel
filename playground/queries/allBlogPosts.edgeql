select BlogPost {
  id,
  title,
  description,
  content,
  author: {
    id,
    name
  }
}
