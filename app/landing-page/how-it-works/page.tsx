import React from 'react';
import { 
  Smartphone, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight, 
} from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Inscription",
      description: "Créez votre compte en 2 minutes",
      icon: Users
    },
    {
      number: "02", 
      title: "Sélection",
      description: "Choisissez votre SFD et tontine",
      icon: CheckCircle
    },
    {
      number: "03",
      title: "Validation", 
      description: "Validation par l'agent SFD",
      icon: Shield
    },
    {
      number: "04",
      title: "Cotisation",
      description: "Cotisez via Mobile Money 24h/24",
      icon: Smartphone
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-secondary/30 via-white to-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Démarrez votre parcours financier en 4 étapes simples
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                {/* Numéro animé */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl font-bold">{step.number}</span>
                  </div>
                  {/* Ligne de connexion */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-accent/30 transform -translate-y-1/2"></div>
                  )}
                </div>

                {/* Icône */}
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Contenu */}
                <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          {/* CTA au bas */}
          <div className="text-center mt-12">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;