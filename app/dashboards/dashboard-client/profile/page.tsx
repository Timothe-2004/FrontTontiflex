'use client'

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Save } from "lucide-react";

const ClientProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "Fatou",
    lastName: "Kone",
    phone: "+229 XX XX XX XX",
    email: "fatou@example.com",
    address: "Porto-Novo, Bénin",
    profession: "Commerçante"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profil mis à jour avec succès !");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <GlassCard hover={false}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center">
                <User className="mr-2" size={32} />
                Mon Profil
              </h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Profession</Label>
                <Input
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  className="bg-white/50"
                />
              </div>

              <GlassButton type="submit" size="lg" className="w-full flex items-center justify-center">
                <Save className="mr-2" size={16} />
                Enregistrer les modifications
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
