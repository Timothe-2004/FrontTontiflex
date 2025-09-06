import React from 'react'
import { GlassButton } from '../GlassButton'
import { CreditCard, Link, Minus, PiggyBank, Plus } from 'lucide-react'
import { GlassCard } from '../GlassCard'

const QuicksActions = () => {
    return (
        <section>
            <GlassCard>
                <h2 className="text-xl font-semibold text-primary mb-6">Actions Rapides</h2>
                <div className="space-y-3">
                    <GlassButton
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <Plus className="mr-2" size={16} />
                        Faire une contribution
                    </GlassButton>

                    <GlassButton
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <Minus className="mr-2" size={16} />
                        Demander un retrait
                    </GlassButton>

                    <GlassButton
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <PiggyBank className="mr-2" size={16} />
                        Ouvrir un compte courant
                    </GlassButton>
                </div>
            </GlassCard>
        </section>
    )
}

export default QuicksActions