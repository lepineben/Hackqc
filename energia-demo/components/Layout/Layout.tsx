import { ReactNode } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

type LayoutProps = {
  children: ReactNode
  title?: string
}

const Layout = ({ children, title = 'ÉnergIA' }: LayoutProps) => {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="ÉnergIA - Hydro-Québec Hackathon Demo" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-8 h-8 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold">ÉnergIA</h1>
          </div>
          <nav className="flex items-center">
            <button 
              onClick={() => router.push('/')} 
              className={`px-3 py-1 mr-2 rounded-md transition-colors duration-200 ${
                router.pathname === '/' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Accueil
            </button>
            {router.pathname !== '/capture' && (
              <button 
                onClick={() => router.push('/capture')} 
                className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                  router.pathname === '/capture' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Capture
              </button>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow px-4 pt-4 pb-20">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-2 md:mb-0">ÉnergIA - Hackathon Demo pour Hydro-Québec</p>
            <div className="flex space-x-4">
              <span className="text-gray-400 text-sm">© 2025 ÉnergIA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout