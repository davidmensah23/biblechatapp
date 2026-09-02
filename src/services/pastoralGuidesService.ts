export interface PastoralGuide {
  id: string;
  emoji: string;
  title: string;
  situationLabel: string;
  apostleId: string;
  apostleName: string;
  scriptureRef: string;
  scriptureText: string;
  subtitle: string;
  reflection: string;
  guidedPrayer: string;
  color: string;
  accentBg: string;
}

export const PASTORAL_GUIDES: PastoralGuide[] = [
  {
    id: "anxiety",
    emoji: "😰",
    title: "When I Feel Anxious",
    situationLabel: "Worry & Stress",
    apostleId: "paul",
    apostleName: "Paul, The Apostle",
    scriptureRef: "Philippians 4:6–7",
    scriptureText: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    subtitle: "Peace that surpasses human understanding",
    reflection: "I wrote these words while chained inside a Roman prison cell. Anxiety tells you that you are utterly alone and that everything hinges on your grip. But prayer is simply opening your white-knuckled fingers and placing the burden into the hands of the One who holds the stars.",
    guidedPrayer: "Father, my chest feels tight and my mind is racing ahead into tomorrow. I hand You the worries I cannot fix or control. Station Your supernatural peace as a guard around my heart right now. In Jesus’ name, Amen.",
    color: "#2563EB",
    accentBg: "#EFF6FF"
  },
  {
    id: "failure",
    emoji: "💔",
    title: "When I Feel Like a Failure",
    situationLabel: "Guilt & Stumbling",
    apostleId: "peter",
    apostleName: "Simon Peter",
    scriptureRef: "John 21:17 & 1 Peter 5:7",
    scriptureText: "Cast all your anxiety on him because he cares for you... Lord, you know all things; you know that I love you. Jesus said, 'Feed my sheep.'",
    subtitle: "Grace and restoration after you stumble",
    reflection: "If anyone knows the crushing shame of failing the Lord, it is me. I swore I would die with Him, yet hours later by a charcoal fire, I cursed and denied I even knew His name. But on the beach at sunrise, Jesus did not bring up my failures—He cooked breakfast and restored my calling. Your stumble is never your final chapter.",
    guidedPrayer: "Lord Jesus, I feel broken and ashamed of how often I fall short. Thank You that You never throw away cracked vessels. Breathe Your restoring grace over me and let me start fresh today. Amen.",
    color: "#DC2626",
    accentBg: "#FEF2F2"
  },
  {
    id: "grief",
    emoji: "🕊️",
    title: "When I'm Grieving or Hurting",
    situationLabel: "Sorrow & Loss",
    apostleId: "john",
    apostleName: "John, The Apostle",
    scriptureRef: "Psalm 34:18 & Revelation 21:4",
    scriptureText: "The Lord is close to the brokenhearted and saves those who are crushed in spirit... He will wipe every tear from their eyes.",
    subtitle: "Holding to God's nearness in dark valleys",
    reflection: "I stood at the foot of the Cross watching my Master bleed. Grief is not a sign of weak faith; it is the sacred ache of love. In the heavy silence of your sorrow, do not feel pressured to put on a brave face. Just lean your head against Christ’s chest as I did at the table, and let Him hold you.",
    guidedPrayer: "God of all comfort, my spirit is wounded and tears come easily. Come sit with me in this quiet ache. Let me feel the shelter of Your wings when I have no strength left. Amen.",
    color: "#7C3AED",
    accentBg: "#F5F3FF"
  },
  {
    id: "anger",
    emoji: "🌪️",
    title: "When Anger Overwhelms Me",
    situationLabel: "Resentment & Rage",
    apostleId: "james",
    apostleName: "James",
    scriptureRef: "James 1:19–20",
    scriptureText: "My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry, because human anger does not produce the righteousness that God desires.",
    subtitle: "Surrendering the fire of bitterness",
    reflection: "Anger feels like power, but it is like drinking poison and expecting someone else to suffer. When offense burns hot, step back. Hand the courtroom over to the righteous Judge who sees all things in secret. True spiritual strength is the courage to release your vengeance.",
    guidedPrayer: "Holy Spirit, cool the fire in my chest. Deliver me from the urge to strike back or harbor resentment. Grant me the supernatural patience to listen and forgive, just as Christ has forgiven me. Amen.",
    color: "#D97706",
    accentBg: "#FFFBEB"
  },
  {
    id: "doubt",
    emoji: "🧭",
    title: "When I Doubt God's Plan",
    situationLabel: "Uncertainty & Fog",
    apostleId: "thomas",
    apostleName: "Thomas",
    scriptureRef: "John 20:27–29",
    scriptureText: "Then he said to Thomas, 'Put your finger here; see my hands. Reach out your hand and put it into my side. Stop doubting and believe.'",
    subtitle: "Honest questions met with gentle truth",
    reflection: "Men labeled me 'Doubting Thomas', but Jesus never cast me out for my honest confusion. He walked straight through locked doors just to let me touch His scars. God is not frightened by your questions or your doubts. Bring your raw honesty to Him; He meets you there.",
    guidedPrayer: "Lord, when the road ahead is dark and I cannot see Your hand, help my unbelief. Anchor my soul not on my fragile feelings, but on Your unchanging goodness. Amen.",
    color: "#059669",
    accentBg: "#ECFDF5"
  },
  {
    id: "calling",
    emoji: "💼",
    title: "When I Feel Lost in My Purpose",
    situationLabel: "Career & Calling",
    apostleId: "matthew",
    apostleName: "Matthew",
    scriptureRef: "Matthew 6:33",
    scriptureText: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
    subtitle: "Stepping into Kingdom alignment",
    reflection: "I sat in my tax collector booth counting Roman silver, rich in money but poor in spirit and despised by my neighbors. When Jesus looked at me and said 'Follow me,' I had to trade worldly certainty for a divine journey. Your calling is not the title on your desk; it is who you follow each morning.",
    guidedPrayer: "Heavenly Father, align my desires with Your kingdom. Free me from the exhausting treadmill of worldly validation. Show me the sacred work You have prepared for my hands today. Amen.",
    color: "#0284C7",
    accentBg: "#F0F9FF"
  }
];
