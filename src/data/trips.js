// voyages en dur pour tester, a remplacer par un fetch API plus tard

export const trips = [
  {
    id: 1,
    titre: "Voyage au Japon",
    dateDebut: "2027-03-10",
    dateFin: "2027-03-24",
    budgetTotal: 2500,
    steps: [
      {
        id: 101,
        titre: "Visite du temple Senso-ji",
        jour: "2027-03-11",
        heure: "09:30",
        cout: 0,
        notes: "Prendre de l'encens à l'entrée et prévoir du liquide pour les souvenirs."
      },
      {
        id: 102,
        titre: "Traversée de Shibuya et shopping",
        jour: "2027-03-11",
        heure: "14:00",
        cout: 120,
        notes: "Monter au Shibuya Sky pour la vue au coucher de soleil."
      },
      {
        id: 103,
        titre: "Dîner Ramen à Shinjuku",
        jour: "2027-03-11",
        heure: "19:30",
        cout: 25,
        notes: "Commander sur la borne automatique à l'extérieur."
      }
    ]
  },
  {
    id: 2,
    titre: "Road trip Italie",
    dateDebut: "2027-07-01",
    dateFin: "2027-07-15",
    budgetTotal: 1800,
    steps: [
      {
        id: 201,
        titre: "Colisée et Forum Romain",
        jour: "2027-07-02",
        heure: "10:00",
        cout: 35,
        notes: "Billet coupe-file obligatoire."
      },
      {
        id: 202,
        titre: "Location de voiture à Florence",
        jour: "2027-07-05",
        heure: "08:30",
        cout: 210,
        notes: "Vérifier la franchise et faire l'état des lieux."
      }
    ]
  },
  {
    id: 3,
    titre: "Week-end à Lisbonne",
    dateDebut: "2027-05-02",
    dateFin: "2027-05-05",
    budgetTotal: 600,
    steps: [
      {
        id: 301,
        titre: "Tour de Belém et Pastéis",
        jour: "2027-05-03",
        heure: "11:00",
        cout: 15,
        notes: "Prendre le tram 15E depuis la Praça da Figueira."
      }
      
    ]
  }
];