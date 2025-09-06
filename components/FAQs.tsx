'use client';
import {Tabs, Tab, Card, CardBody} from "@heroui/react";
import { useState } from "react";
import { clientFAQs, sfdFAQs } from "@/constants";

 function FAQs() {
  const [activeTab, setActiveTab] = useState<'clients' | 'sfd'>('clients');

  return (
    <section className="py-10 bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-green-800 mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-xl text-gray-600">
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>

        <Tabs 
          aria-label="FAQ Categories"
          selectedKey={activeTab}
          onSelectionChange={key => setActiveTab(key as 'clients' | 'sfd')}
          className="w-72 m-auto flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-full p-1 border border-green-200 mb-12"
        >
            <Tab 
              key="clients" 
              title={
                <span className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'clients' ? 'bg-green-600 text-white shadow-lg' : 'text-green-600'
                }`}>
                  Particuliers
                </span>
              }
            >
              <Card className="max-w-4xl mx-auto">
                <CardBody className="space-y-6">
                  {clientFAQs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Tab>

            <Tab 
              key="sfd" 
              title={
                <span className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'sfd' ? 'bg-green-600 text-white shadow-lg' : 'text-green-600'
                }`}>
                  SFD
                </span>
              }
            >
              <Card className="max-w-4xl mx-auto">
                <CardBody className="space-y-6">
                  {sfdFAQs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Tab>
        </Tabs>
      </div>
    </section>
  );
}

export default FAQs;