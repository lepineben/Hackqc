import { ReactNode } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

// Import DemoModeIndicator with client-side only rendering
const DemoModeIndicator = dynamic(
  () => import('../DemoModeIndicator'),
  { ssr: false }
)

type LayoutProps = {
  children: ReactNode
  title?: string
}

const Layout = ({ children, title = 'ÉnergIA' }: LayoutProps) => {
  const router = useRouter()
  
  // Page transition variants
  const pageVariants = {
    hidden: { 
      opacity: 0,
      y: 8
    },
    enter: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.61, 1, 0.88, 1]
      }
    },
    exit: { 
      opacity: 0,
      y: -8,
      transition: {
        duration: 0.25,
        ease: [0.61, 1, 0.88, 1]
      }
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="ÉnergIA - Hydro-Québec Hackathon Demo" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-8 h-8 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold font-display">ÉnergIA</h1>
          </motion.div>
          
          <motion.nav 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button 
              onClick={() => router.push('/')} 
              className={`px-3 py-1 mr-3 rounded-md transition-all duration-200 transform hover:scale-105 ${
                router.pathname === '/' 
                  ? 'bg-white bg-opacity-20 shadow-sm' 
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Accueil
            </button>
            
            {router.pathname !== '/capture' && (
              <button 
                onClick={() => router.push('/capture')} 
                className={`px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 ${
                  router.pathname === '/capture' 
                    ? 'bg-white bg-opacity-20 shadow-sm' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Capture
              </button>
            )}
          </motion.nav>
        </div>
      </header>
      
      <main className="flex-grow px-4 pt-6 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial="hidden"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            className="max-w-6xl mx-auto w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Demo mode indicator */}
      <DemoModeIndicator position="bottom-right" />
      
      <footer className="bg-secondary-800 text-white py-4 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p 
              className="mb-2 md:mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              ÉnergIA - Hackathon Demo pour Hydro-Québec
            </motion.p>
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className="text-secondary-400 text-sm">© 2025 ÉnergIA</span>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout