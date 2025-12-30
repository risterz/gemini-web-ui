import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import ControlPanel from './components/ControlPanel'
import Gallery from './components/Gallery'
import LoadingOverlay from './components/LoadingOverlay'
import SettingsModal from './components/SettingsModal'
import './index.css'

function App() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleGenerate = async (promptData) => {
    setIsGenerating(true)
    setGeneratedImages([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedImages(data.images)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert(`Failed to generate: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="app">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Hero />
          <ControlPanel onGenerate={handleGenerate} isGenerating={isGenerating} />

          {generatedImages.length > 0 && (
            <Gallery images={generatedImages} />
          )}
        </motion.div>
      </main>

      {isGenerating && <LoadingOverlay />}
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  )
}

export default App
