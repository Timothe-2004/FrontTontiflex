import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/GlassCard";
import {
  Smartphone, Shield, Users, CreditCard, CheckCircle
} from 'lucide-react';
import { features } from "@/constants";
import HowItWorks from "./how-it-works/page";
import FAQs from "@/components/FAQs";
import CTA from "@/components/CTA";
import Hero from "./hero/page";

const Home = () => {


  const valuePropositions = [
    {
      icon: Shield,
      title: "Tontines Digitales",
      description: "Vos fonds sont protégés selon les normes BCEAO/UEMOA"
    },
    {
      icon: Smartphone,
      title: "Accès Mobile",
      description: "Gérez vos tontines depuis votre smartphone, n'importe où"
    },
    {
      icon: CreditCard,
      title: "Paiements Mobile Money",
      description: "Contributions faciles via MTN et Moov Money"
    },
    {
      icon: Users,
      title: "Communauté Solidaire",
      description: "Rejoignez des groupes de personnes entrepreneures"
    }
  ];

  const howItWorksSteps = [
    {
      icon: Users,
      title: "Inscrivez-vous",
      description: "Créez votre compte en quelques clics"
    },
    {
      icon: CheckCircle,
      title: "Rejoignez une tontine",
      description: "Choisissez la tontine qui correspond à vos besoins"
    },
    {
      icon: CreditCard,
      title: "Effectuez vos contributions",
      description: "Payez facilement via Mobile Money"
    },
    {
      icon: Smartphone,
      title: "Suivez vos finances",
      description: "Consultez vos soldes et historiques à tout moment"
    }
  ];

  return (
    <div className="">
      <section className="container px-4 m-auto">
        <Hero />
      </section>
      {/* Value Propositions */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Pourquoi choisir TontiFlex ?
        </h2>
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, Home) => (
            <GlassCard key={Home} className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 py-16 m-auto">
        <HowItWorks />
      </section>
      <section className="container px-4 py-16 m-auto">
        <FAQs />
      </section>
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <CTA />
      </section>

    </div>
  );
};

export default Home;