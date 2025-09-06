'use client'
import React from 'react';
import { ArrowLeft, Code, Wrench, Clock, Zap, Coffee, Rocket, CheckCircle } from 'lucide-react';

const UnderDevelopmentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Bouton de retour */}
        <button 
          onClick={() => window.history.back()}
          className="mb-8 inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/80 transition-all duration-200 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </button>

        {/* Carte principale */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Animations de fond */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-100 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-100 rounded-full opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          {/* Contenu principal */}
          <div className="relative z-10">
            {/* Icône principale animée */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Code className="text-white" size={40} />
            </div>

            {/* Titre principal */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
              Page en développement
            </h1>

            {/* Sous-titre */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Notre équipe travaille actuellement sur cette fonctionnalité pour vous offrir la meilleure expérience possible.
            </p>

            {/* Barre de progression animée */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progression du développement</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: '75%',
                    animation: 'progress-fill 2s ease-out'
                  }}
                ></div>
              </div>
            </div>

            {/* Fonctionnalités en cours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Wrench className="text-emerald-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Interface</h3>
                <p className="text-xs text-gray-600">Design et ergonomie</p>
                <div className="flex items-center justify-center mt-2">
                  <CheckCircle className="text-green-500" size={16} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Backend</h3>
                <p className="text-xs text-gray-600">API et logique métier</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Rocket className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Tests</h3>
                <p className="text-xs text-gray-600">Validation et qualité</p>
                <div className="flex items-center justify-center mt-2">
                  <Clock className="text-gray-400" size={16} />
                </div>
              </div>
            </div>

            {/* Message avec café */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Coffee className="text-amber-600" size={20} />
                <p className="text-amber-800 font-medium">
                  Nos développeurs sont sur le coup ! ☕
                </p>
              </div>
            </div>

            {/* Estimation */}
            <div className="text-center">
              <p className="text-gray-600 mb-2">Disponibilité estimée</p>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-semibold">
                <Clock size={16} />
                Bientôt disponible
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            En attendant, vous pouvez explorer les autres fonctionnalités disponibles
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-all duration-200 text-sm text-gray-700">
              📊 Tableau de bord
            </button>
            <button className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-all duration-200 text-sm text-gray-700">
              💰 Comptes épargne
            </button>
            <button className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-all duration-200 text-sm text-gray-700">
              🔄 Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Styles pour l'animation de la barre de progression */}
      <style jsx>{`
        @keyframes progress-fill {
          from {
            width: 0%;
          }
          to {
            width: 75%;
          }
        }
      `}</style>
    </div>
  );
};

export default UnderDevelopmentPage;