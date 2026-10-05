import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import { auth, currentUser } from '@clerk/nextjs/server'
import { SignInButton, Show, UserButton } from '@clerk/nextjs'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  await auth.protect()
  const clerkUser = await currentUser()

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <header className="header">
        <div className="brand">Streaming Platform</div>
        <div className="auth-controls">
          <Show when="signed-out">
            <SignInButton>
              <button className="auth-btn sign-in-btn">Sign In</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      <div className="content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        <h1>
          Welcome back,{' '}
          {clerkUser?.firstName || clerkUser?.emailAddresses?.[0]?.emailAddress || user?.email || 'User'}!
        </h1>
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  )
}
