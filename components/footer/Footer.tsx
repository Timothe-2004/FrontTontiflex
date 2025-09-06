import React from "react"
import Link from "next/link";
export function Footer() {
  return (
      <footer className="bg-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold text-primary">TontiFlex</span>
              </div>
              <p className="text-gray-600">
                Digitalisation des tontines pour les femmes rurales du Bénin
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Services</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/tontines" className="hover:text-primary">Tontines</a></li>
                <li><a href="/savings" className="hover:text-primary">Épargne</a></li>
                <li><a href="/loan" className="hover:text-primary">Crédit</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/support" className="hover:text-primary">Centre d'aide</a></li>
                <li>+229 XX XX XX XX</li>
                <li>support@tontiflex.bj</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Partenaires Mobile Money</h4>
              <div className="flex space-x-4">
                <div className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-bold">MTN</div>
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">Moov</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 TontiFlex. Tous droits réservés. Conforme aux normes BCEAO/UEMOA.</p>
          </div>
        </div>
      </footer>
  )
}
export default Footer;

