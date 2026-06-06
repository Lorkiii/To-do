export type BlogPostListItem = {
  id: string;
  title: string;
  content: string;
  images: Array<{
    id: string;
    url: string;
    fileName: string;
    altText?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
