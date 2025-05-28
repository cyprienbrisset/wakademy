"use client"

import type { Content } from "@/lib/content/content-service"
import ContentPageHeader from "./content-page-header"

interface ContentPageHeaderWrapperProps {
  content: Content
}

export default function ContentPageHeaderWrapper({ content }: ContentPageHeaderWrapperProps) {
  return <ContentPageHeader content={content} />
} 