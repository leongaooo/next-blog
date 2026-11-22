'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { ComponentProps, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  // giscus 的 repo / repositoryId 来自环境变量，未配置时不渲染，避免文章末尾留一个点不动的英文按钮
  const comments = siteMetadata.comments as
    | { provider?: string; giscusConfig?: { repo?: string; repositoryId?: string } }
    | undefined
  if (
    comments?.provider !== 'giscus' ||
    !comments.giscusConfig?.repo ||
    !comments.giscusConfig?.repositoryId
  ) {
    return null
  }
  const config = siteMetadata.comments as unknown as ComponentProps<
    typeof CommentsComponent
  >['commentsConfig']

  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={config} slug={slug} />
      ) : (
        <button className="comments-load" type="button" onClick={() => setLoadComments(true)}>
          加载评论
        </button>
      )}
    </>
  )
}
