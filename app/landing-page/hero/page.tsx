import { GlassButton } from '@/components/GlassButton'
import { ArrowRight, Link } from 'lucide-react'
import React from 'react'
import Image from 'next/image'
import { imagesHero } from '@/constants'
const Hero = () => {
  return (
      <section className="container m-auto px-4 grid grid-cols-2">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-primary font-archivo mb-6 animate-fade-in">
            Simplifiez vos tontines, épargnez en sécurité
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            La première plateforme digitale qui connecte tous les SFD du Bénin pour vos tontines, épargnes et prêts. Cotisez via Mobile Money 24h/24.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton
                size="sm"
                className="text-lg py-4"
              >
                Commencer maintenant
              </GlassButton>
              <GlassButton
                variant="outline"
                size="sm"
                className="text-lg py-4"
              >
                Découvrir les tontines
              </GlassButton>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 max-w-2xl mx-auto p-4 justify-center items-center">
          {imagesHero.map((image, index) => (
            <div
              key={index}
              className={`${image.size} rounded-2xl overflow-hidden shadow-lg transform rotate-${Math.floor(Math.random() * 12) - 6}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
  )
}

export default Hero