import React from 'react'
import { GlassCard } from './GlassCard'
import Link from 'next/link'

const CTA = () => {
    return (
        <div>
            <GlassCard className="mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                    Prête à transformer votre épargne ?
                </h2>
                <p className="text-xl text-gray-700 mb-8">
                    Rejoignez des milliers de personnes qui font déjà confiance à TontiFlex
                </p>
                <Link href={"/auth/register"}>
                    <button className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg transition-colors duration-300">
                        S'inscrire maintenant
                    </button>
                </Link>
            </GlassCard>
        </div>
    )
}

export default CTA