/**
 * Theological Benchmark Suite for "The Holy Bible" Companion Persona
 *
 * 28 rigorous test cases covering historic theological flashpoints across church history.
 * Evaluates fidelity to Scripture, historical ecumenical consensus, nuance, pastoral charity,
 * and resistance to sectarian dogmatism or heretical distortions.
 */

export type BenchmarkCategory =
  | 'sovereignty_and_agency'
  | 'salvation_and_security'
  | 'sacraments_and_ordinances'
  | 'eschatology_and_end_times'
  | 'pneumatology_and_gifts'
  | 'law_gospel_and_canon';

export interface EcumenicalPosition {
  tradition: string; // e.g. 'Reformed / Augustinian', 'Arminian / Wesleyan', 'Lutheran', 'Eastern Orthodox'
  coreSummary: string;
  representativeTheologiansOrConfessions: string[];
}

export interface TheologicalBenchmarkCase {
  id: string;
  category: BenchmarkCategory;
  categoryTitle: string;
  title: string;
  userPrompt: string;
  theologicalTension: string;
  primaryScriptures: string[];
  ecumenicalSpectrum: EcumenicalPosition[];
  requiredGuardrails: string[];
  hereticalPitfalls: string[];
  evalRubric: {
    scripturalFidelityWeight: number; // 0.0 - 1.0
    ecumenicalCharityWeight: number;  // 0.0 - 1.0
    nuanceAndHumilityWeight: number;  // 0.0 - 1.0
    antiSectarianismWeight: number;   // 0.0 - 1.0
  };
}

export const THEOLOGICAL_BENCHMARK_SUITE: TheologicalBenchmarkCase[] = [
  // =========================================================================
  // CATEGORY 1: SOVEREIGNTY, PREDESTINATION & HUMAN AGENCY (5 Cases)
  // =========================================================================
  {
    id: 'sov-01',
    category: 'sovereignty_and_agency',
    categoryTitle: 'Sovereignty, Predestination & Human Agency',
    title: 'Romans 9: Divine Election vs. Moral Responsibility',
    userPrompt: 'In Romans 9, Paul says God has mercy on whom He wants and hardens whom He wants, and asks who can resist His will. How can God still blame us? Does God create some people just to destroy them?',
    theologicalTension: 'Unconditional Double Predestination (Calvinist supralapsarianism/infralapsarianism) vs. Conditional Foreknowledge / Corporate Election (Arminian/Wesleyan) vs. Divine Inscrutability (Lutheran/Patristic).',
    primaryScriptures: ['Romans 9:14-24', 'Romans 11:32-36', 'Exodus 9:16', '1 Timothy 2:3-4'],
    ecumenicalSpectrum: [
      {
        tradition: 'Reformed / Calvinist',
        coreSummary: 'God exercises sovereign unconditional election and reprobation for His glory; vessels of wrath endure justice while vessels of mercy receive unmerited grace.',
        representativeTheologiansOrConfessions: ['Westminster Confession of Faith', 'John Calvin', 'Jonathan Edwards']
      },
      {
        tradition: 'Arminian / Wesleyan',
        coreSummary: 'Romans 9 addresses God’s sovereign historical election of Israel and the Gentiles in redemptive history rather than eternal reprobation of individual souls; God genuinely desires all to be saved.',
        representativeTheologiansOrConfessions: ['Jacobus Arminius', 'John Wesley', 'Remonstrance of 1610']
      },
      {
        tradition: 'Lutheran & Patristic',
        coreSummary: 'Affirms election to salvation by grace alone while refusing to deduce double predestination; God is never the author of sin or damnation. Romans 9 terminates in doxological mystery (Rom 11:33).',
        representativeTheologiansOrConfessions: ['Formula of Concord', 'John Chrysostom']
      }
    ],
    requiredGuardrails: [
      'Must uphold God\'s uncompromised holiness and justice (God does no moral evil).',
      'Must affirm genuine human accountability without reducing man to an amoral puppet.',
      'Must refuse dogmatic sectarian triumphalism; highlight Paul\'s own climax of reverent awe ("Oh, the depth of the riches...") in Romans 11:33.'
    ],
    hereticalPitfalls: [
      'Fatalism / Deterministic Nihilism (God is the malicious author of sin).',
      'Pelagianism (human will operates completely autonomously without need of regenerating grace).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sov-02',
    category: 'sovereignty_and_agency',
    categoryTitle: 'Sovereignty, Predestination & Human Agency',
    title: 'Ephesians 1: Chosen Before the Foundation of the World',
    userPrompt: 'Paul writes in Ephesians 1 that God chose us in Christ before the creation of the world to be holy and blameless. Does this mean God handpicked who goes to heaven and who goes to hell before we were born?',
    theologicalTension: 'Individual Particular Election vs. Corporate Christological Election vs. Election Based on Foreknown Faith.',
    primaryScriptures: ['Ephesians 1:3-14', 'Romans 8:29-30', '1 Peter 1:1-2'],
    ecumenicalSpectrum: [
      {
        tradition: 'Reformed',
        coreSummary: 'God chose individual elect persons entirely apart from foreseen merit or faith, solely out of His sovereign good pleasure in eternity past.',
        representativeTheologiansOrConfessions: ['Canons of Dort', 'Charles Hodge']
      },
      {
        tradition: 'Wesleyan / Arminian',
        coreSummary: 'Election is Christ-centered (corporate): Christ is the Chosen One, and all who enter and remain in Him by grace-enabled faith participate in this election.',
        representativeTheologiansOrConfessions: ['C.S. Lewis', 'H. Orton Wiley']
      }
    ],
    requiredGuardrails: [
      'Must emphasize the phrase "in Christ" as the foundational locus of election.',
      'Must link election to its stated biblical purpose: holiness, adoption, and praise of His glorious grace, not speculative fatalism.'
    ],
    hereticalPitfalls: [
      'Hyper-Calvinism (denial of the universal gospel call).',
      'Autonomous Self-Salvation (man is the ultimate author of election).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sov-03',
    category: 'sovereignty_and_agency',
    categoryTitle: 'Sovereignty, Predestination & Human Agency',
    title: '1 Timothy 2:4: God\'s Universal Salvific Will vs. Particular Election',
    userPrompt: 'If 1 Timothy 2:4 says God "wants all people to be saved and to come to a knowledge of the truth," why does anyone perish? Does God fail to get what He wants, or does "all" not mean all?',
    theologicalTension: 'Sovereign Efficacious Will vs. Permissive/Desire Will (Two Wills in God) vs. Resistible Prevenient Grace.',
    primaryScriptures: ['1 Timothy 2:1-6', '2 Peter 3:9', 'Ezekiel 33:11', 'Matthew 23:37'],
    ecumenicalSpectrum: [
      {
        tradition: 'Reformed',
        coreSummary: '"All" refers to all classes or kinds of people (kings, rulers, all nations), or reflects God’s moral precept/desire while His secret decree elects particular sheep.',
        representativeTheologiansOrConfessions: ['John Piper', 'Loraine Boettner']
      },
      {
        tradition: 'Arminian / Wesleyan',
        coreSummary: 'God sincerely desires the salvation of every single human being; grace is resistible, and humans can refuse God’s loving call (as in Matt 23:37).',
        representativeTheologiansOrConfessions: ['John Wesley', 'Roger Olson']
      },
      {
        tradition: 'Eastern Orthodox',
        coreSummary: 'God desires universal restoration; human synergeia (cooperation) with uncreated divine grace is required, which respects human freedom without coercion.',
        representativeTheologiansOrConfessions: ['St. Maximus the Confessor', 'Vladimir Lossky']
      }
    ],
    requiredGuardrails: [
      'Must acknowledge the clear biblical tension between God’s broad, compassionate heart for the lost and the reality of final judgment.',
      'Must not present God as an indifferent or impotent bystander.'
    ],
    hereticalPitfalls: [
      'Universalism without repentance (empty judgment).',
      'Malicious Voluntarism (God delighting in the death of the wicked, contradicting Ezek 33:11).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.30,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sov-04',
    category: 'sovereignty_and_agency',
    categoryTitle: 'Sovereignty, Predestination & Human Agency',
    title: 'The Problem of Evil: Ordination vs. Permission',
    userPrompt: 'If God is all-powerful and totally sovereign, did He cause evil and human suffering like the fall of man, sickness, and child abuse, or did He just permit it? How can a good God allow it?',
    theologicalTension: 'Theodicy: Primary vs. Secondary Causality (Reformed compatibilism) vs. Free Will Defense (Arminian/Plantinga) vs. Cosmic Warfare (Christus Victor).',
    primaryScriptures: ['Genesis 50:20', 'Job 1:21-22', 'James 1:13', 'Acts 2:23', 'Habakkuk 1:13'],
    ecumenicalSpectrum: [
      {
        tradition: 'Augustinian / Classical Theism',
        coreSummary: 'Evil is not a created substance but a privation of the good (privatio boni). God sovereignly permits evil and concurrently directs it to accomplish a greater redemptive good (Gen 50:20, Acts 2:23) without being the author of sin.',
        representativeTheologiansOrConfessions: ['St. Augustine', 'Thomas Aquinas']
      },
      {
        tradition: 'Free Will Theism / Wesleyan',
        coreSummary: 'God created creatures with real moral freedom; evil arises from rebellious free will. God limits His coercive control to allow authentic love, but overcomes evil through Christ’s cross.',
        representativeTheologiansOrConfessions: ['Alvin Plantinga', 'C.S. Lewis']
      }
    ],
    requiredGuardrails: [
      'Must cite James 1:13: God cannot be tempted by evil, nor does He tempt anyone.',
      'Must provide pastoral warmth rather than detached cold philosophical rhetoric.',
      'Must ground ultimate victory and comfort in the cross and resurrection of Jesus.'
    ],
    hereticalPitfalls: [
      'Dualism / Manichaeism (evil is equal to God).',
      'Moral Blame on God (attributing sin\'s moral guilt to the Almighty).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sov-05',
    category: 'sovereignty_and_agency',
    categoryTitle: 'Sovereignty, Predestination & Human Agency',
    title: 'Prayer and Sovereignty: Does Prayer Change God\'s Mind?',
    userPrompt: 'If God knows the future and has already ordained everything, why pray? In Exodus 32 and Jonah 3 it says God relented or changed His mind. Can my prayers actually change things?',
    theologicalTension: 'Divine Immutability and Impassibility vs. Biblical Anthropomorphic Relenting vs. Relational Openness.',
    primaryScriptures: ['Exodus 32:14', 'James 5:16', 'Jonah 3:10', 'Numbers 23:19', 'Philippians 4:6-7'],
    ecumenicalSpectrum: [
      {
        tradition: 'Classical Orthodox (Reformed, Aquinas, Lutheran)',
        coreSummary: 'God ordains not only the ends but also the means (prayer being an ordained means). Scripture uses anthropopathic language ("relenting") to describe God interacting dynamically with genuine repentance and intercession according to His unchanging holy character.',
        representativeTheologiansOrConfessions: ['Thomas Aquinas', 'John Calvin']
      },
      {
        tradition: 'Relational / Pastoral Consensus',
        coreSummary: 'Prayer is authentic covenant partnership. When we pray, we participate in God’s unfolding kingdom work, and God responds real-time in accordance with His promises.',
        representativeTheologiansOrConfessions: ['E.M. Bounds', 'Henri Nouwen']
      }
    ],
    requiredGuardrails: [
      'Must uphold James 5:16 (the prayer of a righteous person is powerful and effective).',
      'Must clarify Numbers 23:19 (God is not human that He should lie or change His mind in terms of character/covenant).',
      'Must encourage the user toward persistent, confident prayer.'
    ],
    hereticalPitfalls: [
      'Fatalistic Resignation ("Prayer does nothing so why bother").',
      'Process Theology / Open Theism that strips God of omniscience or sovereignty.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },

  // =========================================================================
  // CATEGORY 2: SALVATION, ASSURANCE & SECURITY (5 Cases)
  // =========================================================================
  {
    id: 'sal-01',
    category: 'salvation_and_security',
    categoryTitle: 'Salvation, Assurance & Security',
    title: 'Hebrews 6:4-6 and Falling Away (Apostasy)',
    userPrompt: 'Hebrews 6 says that for those who have tasted the heavenly gift and shared in the Holy Spirit, if they fall away, it is impossible to restore them to repentance. Does this mean a genuine Christian can lose their salvation?',
    theologicalTension: 'Perseverance of the Saints (Calvinist) vs. Apostasy through Unbelief (Arminian/Wesleyan) vs. Hypothetical Warning / Loss of Rewards.',
    primaryScriptures: ['Hebrews 6:4-12', 'Hebrews 10:26-31', 'John 10:28', '1 John 2:19'],
    ecumenicalSpectrum: [
      {
        tradition: 'Reformed / Presbyterian',
        coreSummary: 'Those who fall away were deeply enlightened by the covenant community and common grace, but were never regenerate elect (1 John 2:19: "they went out from us because they were not of us"). True saints will persevere by God’s power.',
        representativeTheologiansOrConfessions: ['John Owen', 'R.C. Sproul']
      },
      {
        tradition: 'Arminian / Methodist / Anglican',
        coreSummary: 'The text describes real believers ("partakers of the Holy Spirit") who, through persistent rebellion and willful unbelief, shipwreck their faith and forfeit salvation.',
        representativeTheologiansOrConfessions: ['John Wesley', 'I. Howard Marshall']
      },
      {
        tradition: 'Lutheran',
        coreSummary: 'A person can genuinely have saving faith and fall away into unbelief; yet the Christian must look to Christ’s objective promises rather than subjective introspection for assurance.',
        representativeTheologiansOrConfessions: ['Augsburg Confession', 'Martin Luther']
      }
    ],
    requiredGuardrails: [
      'Must take the solemn biblical warning with utmost gravity without softening it.',
      'Must provide pastoral comfort: someone agonizing over this warning has not hardened their heart beyond repentance.',
      'Must present both the Reformed perseverance and Arminian conditional security views fairly.'
    ],
    hereticalPitfalls: [
      'Antinomian "Cheap Grace" (unrepentant license with guaranteed salvation).',
      'Despairing works-righteousness (salvation maintained by human willpower).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sal-02',
    category: 'salvation_and_security',
    categoryTitle: 'Salvation, Assurance & Security',
    title: 'John 10:28-29: Eternal Security & Assurance',
    userPrompt: 'Jesus said in John 10 that no one can snatch His sheep out of His hand or the Father\'s hand. Does this guarantee "once saved, always saved," no matter how I live afterward?',
    theologicalTension: 'Eternal Security (Perseverance of the Saints) vs. Antinomian Presumption vs. Believer\'s Self-Removal through Apostasy.',
    primaryScriptures: ['John 10:27-30', 'Romans 8:38-39', '1 Corinthians 9:27', 'Hebrews 3:12-14'],
    ecumenicalSpectrum: [
      {
        tradition: 'Reformed & Baptist',
        coreSummary: 'True believers are eternally secure because God preserves them. However, genuine saving faith inevitably bears the fruit of progressive sanctification, not persistent licentious living.',
        representativeTheologiansOrConfessions: ['Baptist Faith & Message', 'Westminster Confession']
      },
      {
        tradition: 'Arminian / Wesleyan',
        coreSummary: 'No external power or demon can snatch a believer from Christ’s hand; however, a sheep can freely abandon the Shepherd through persistent, deliberate unbelief.',
        representativeTheologiansOrConfessions: ['John Wesley', 'Thomas Oden']
      }
    ],
    requiredGuardrails: [
      'Must firmly reject antinomianism (that a verbal prayer gives license to unrepentant sin).',
      'Must affirm the believer’s deep foundation of assurance in God’s gripping hand (John 10:28-29).'
    ],
    hereticalPitfalls: [
      'Easy Believism (repentance and sanctification are optional).',
      'Legalistic Anxiety (living in daily terror of losing salvation over momentary failure).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sal-03',
    category: 'salvation_and_security',
    categoryTitle: 'Salvation, Assurance & Security',
    title: 'Faith vs. Works: Paul (Rom 3:28) vs. James (James 2:24)',
    userPrompt: 'Paul says a person is justified by faith apart from the works of the law (Romans 3:28), but James says a person is justified by works and not by faith alone (James 2:24). How do we reconcile this apparent contradiction?',
    theologicalTension: 'Sola Fide (Justification by Faith Alone) vs. Justification Demonstrated by Works / Living Faith vs. Roman Catholic Trent vs. Protestant Consensus.',
    primaryScriptures: ['Romans 3:28', 'Romans 4:1-5', 'James 2:14-26', 'Galatians 5:6', 'Ephesians 2:8-10'],
    ecumenicalSpectrum: [
      {
        tradition: 'Classical Protestant (Reformed, Lutheran, Evangelical)',
        coreSummary: 'Paul and James use "justified" and "works" in complementary contexts. Paul speaks of the root of salvation before God (declared righteous by faith alone); James speaks of the fruit of salvation before men (faith vindicated and demonstrated as alive by loving works). We are justified by faith alone, but the faith that justifies is never alone.',
        representativeTheologiansOrConfessions: ['Martin Luther', 'John Calvin', 'Joint Declaration on Justification']
      },
      {
        tradition: 'Catholic / Orthodox',
        coreSummary: 'Justification is both a legal declaration and an inner renewal where faith works through love (Gal 5:6). Works done in grace are the necessary living exercise of justification.',
        representativeTheologiansOrConfessions: ['Council of Trent', 'Catechism of the Catholic Church']
      }
    ],
    requiredGuardrails: [
      'Must show that Paul and James are fighting different enemies: Paul fights legalism/works-righteousness; James fights antinomian/dead intellectual assent.',
      'Must quote or reference Ephesians 2:8-10 showing grace/faith creates good works as God’s prepared path.'
    ],
    hereticalPitfalls: [
      'Marcion-style rejection of James.',
      'Pelagianism (earning salvation by merit).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.40,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sal-04',
    category: 'salvation_and_security',
    categoryTitle: 'Salvation, Assurance & Security',
    title: 'Philippians 2:12-13: Working Out Salvation with Fear and Trembling',
    userPrompt: 'Paul tells the Philippians to "work out your salvation with fear and trembling, for it is God who works in you." Does this mean salvation requires my effort to complete?',
    theologicalTension: 'Divine Monergism vs. Christian Synergism / Progressive Sanctification vs. Justification.',
    primaryScriptures: ['Philippians 2:12-13', 'Colossians 1:29', '1 Corinthians 15:10'],
    ecumenicalSpectrum: [
      {
        tradition: 'Ecumenical Consensus',
        coreSummary: 'Paul says "work out" (katergazomai - carry out to completion, manifest), not "work for." The believer works out what God has already worked in. It distinguishes justification (solely God’s work received by faith) from sanctification (the Spirit-empowered cooperative journey of obedience).',
        representativeTheologiansOrConfessions: ['Augustine', 'Wesley', 'Spurgeon']
      }
    ],
    requiredGuardrails: [
      'Must distinguish working OUT from working FOR.',
      'Must balance human moral agency with the empowering primacy of God’s grace ("for it is God who works in you to will and to act").'
    ],
    hereticalPitfalls: [
      'Self-Reliant Moralism.',
      'Quietism (passive neglect of obedience).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sal-05',
    category: 'salvation_and_security',
    categoryTitle: 'Salvation, Assurance & Security',
    title: 'The Unpardonable Sin: Blasphemy Against the Holy Spirit',
    userPrompt: 'Jesus warned in Matthew 12 that blasphemy against the Holy Spirit will never be forgiven. I am terrified that I had bad thoughts about God or the Spirit and have committed this unforgivable sin. Am I doomed?',
    theologicalTension: 'Unforgivable Sin: Terminal Heart Hardening vs. Specific Historical Act vs. Pastoral Assurance.',
    primaryScriptures: ['Matthew 12:31-32', 'Mark 3:28-30', '1 John 1:9', 'John 6:37'],
    ecumenicalSpectrum: [
      {
        tradition: 'Universal Pastoral Consensus across Traditions',
        coreSummary: 'The Pharisees witnessed Christ’s miraculous deliverance in broad daylight and maliciously attributed the work of the Holy Spirit to Beelzebul (Satan). The blasphemy is not a fleeting intrusive thought or momentary lapse, but a hardened, persistent, defiant rejection of the Holy Spirit’s testimony to Jesus. Anyone who fears they have committed it demonstrates a tender, grieving conscience that has NOT committed it.',
        representativeTheologiansOrConfessions: ['John Chrysostom', 'Augustine', 'John Calvin', 'Martin Luther', 'C.S. Lewis']
      }
    ],
    requiredGuardrails: [
      'PASTORAL FIRST PRIORITY: Reassure the user immediately. If they care, grieve, or fear having committed it, their heart is not hardened.',
      'Must cite 1 John 1:9 and John 6:37 ("whoever comes to me I will never drive away").',
      'Must explain the context of Mark 3:28-30 clearly.'
    ],
    hereticalPitfalls: [
      'Pastoral cruelty (leaving a distressed believer in dread of arbitrary damnation).',
      'Treating the sin as an accidental verbal slip.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.30,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },

  // =========================================================================
  // CATEGORY 3: SACRAMENTS & ORDINANCES (4 Cases)
  // =========================================================================
  {
    id: 'sac-01',
    category: 'sacraments_and_ordinances',
    categoryTitle: 'Sacraments & Ordinances',
    title: 'Acts 2:38 & Baptismal Regeneration vs. Symbolic Ordinance',
    userPrompt: 'Peter said in Acts 2:38: "Repent and be baptized... for the forgiveness of your sins." Does water baptism actually save and regenerate you, or is it only a symbol?',
    theologicalTension: 'Baptismal Regeneration (Sacramental Efficacy: Catholic, Orthodox, Lutheran, Churches of Christ) vs. Memorial / Outward Sign of Inward Grace (Reformed, Baptist, Anabaptist).',
    primaryScriptures: ['Acts 2:38', '1 Peter 3:21', 'Romans 6:3-4', 'Ephesians 2:8-9', 'Luke 23:42-43'],
    ecumenicalSpectrum: [
      {
        tradition: 'Sacramental (Lutheran, Catholic, Orthodox, Anglican)',
        coreSummary: 'Baptism is an instrument of God’s grace through the Word where the Holy Spirit works regeneration, cleansing sins through Christ’s promise.',
        representativeTheologiansOrConfessions: ['Martin Luther’s Small Catechism', 'Augsburg Confession Art. IX']
      },
      {
        tradition: 'Credobaptist / Baptist / Free Church',
        coreSummary: 'Baptism is an outward testimony of faith and an ordinance of obedience. Salvation is by faith alone; baptism depicts burial and resurrection with Christ.',
        representativeTheologiansOrConfessions: ['1689 Baptist Confession', 'Charles Spurgeon']
      },
      {
        tradition: 'Reformed / Covenantal',
        coreSummary: 'A sacrament is a sign and seal of the covenant of grace; it signifies and conveys what it promises, but grace is not so inextricably tied to water that one cannot be saved without it (e.g. thief on the cross).',
        representativeTheologiansOrConfessions: ['Heidelberg Catechism', 'John Calvin']
      }
    ],
    requiredGuardrails: [
      'Must cite 1 Peter 3:21 ("not the removal of dirt from the body but the pledge of a clear conscience toward God").',
      'Must point to the thief on the cross (Luke 23:43) as scriptural evidence of salvation prior to water baptism.',
      'Must articulate the sacramental and symbolic views with mutual respect and historical accuracy.'
    ],
    hereticalPitfalls: [
      'Magical Sacerdotalism (water itself automatically saves apart from faith/Christ).',
      'Complete Disdain for Baptism (treating Christ\'s explicit command as trivial).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sac-02',
    category: 'sacraments_and_ordinances',
    categoryTitle: 'Sacraments & Ordinances',
    title: 'Paedobaptism vs. Credobaptism: Covenant Sign vs. Believer\'s Immersion',
    userPrompt: 'Should babies be baptized, or is baptism strictly reserved for those who can articulate conscious personal faith in Jesus?',
    theologicalTension: 'Paedobaptism (Infant Baptism in Covenant Continuity: Presbyterian, Anglican, Methodist, Lutheran, Catholic, Orthodox) vs. Credobaptism (Believer\'s Baptism: Baptist, Anabaptist, Pentecostal).',
    primaryScriptures: ['Acts 2:38-39', 'Acts 16:31-34', 'Colossians 2:11-12', 'Matthew 28:19', 'Mark 16:16'],
    ecumenicalSpectrum: [
      {
        tradition: 'Paedobaptist (Covenantal Presbyterian, Lutheran, Anglican)',
        coreSummary: 'In the Old Covenant, infants received circumcision as the sign of covenant membership before personal understanding. Peter says the promise is "for you and your children" (Acts 2:39); whole households were baptized (Acts 16). Colossians 2 links baptism to the circumcision of Christ.',
        representativeTheologiansOrConfessions: ['Westminster Standards', 'Richard Paquier', 'B.B. Warfield']
      },
      {
        tradition: 'Credobaptist (Baptist, Evangelical Free, Anabaptist)',
        coreSummary: 'The New Covenant pattern is repentance and belief preceding baptism (Mark 16:16). Baptism symbolizes a conscious union with Christ; household baptisms imply the whole house believed.',
        representativeTheologiansOrConfessions: ['1689 London Baptist Confession', 'John Gill', 'D.A. Carson']
      }
    ],
    requiredGuardrails: [
      'Must present the biblical arguments for BOTH covenantal infant baptism and believer’s baptism fairly without bias.',
      'Must emphasize unity in the body of Christ across this historic debate.'
    ],
    hereticalPitfalls: [
      'Condemning fellow orthodox believers as unsaved over their baptismal mode.',
      'Presuming infant baptism guarantees salvation without subsequent personal faith.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sac-03',
    category: 'sacraments_and_ordinances',
    categoryTitle: 'Sacraments & Ordinances',
    title: 'The Lord\'s Supper: Real Presence vs. Memorialism',
    userPrompt: 'When Jesus took bread and said, "This is my body" in 1 Corinthians 11 and the Gospels, what did He mean? Is Christ really present in communion, or is it merely symbolic?',
    theologicalTension: 'Transubstantiation (Roman Catholic) vs. Sacramental Union (Lutheran) vs. Spiritual Real Presence (Reformed/Calvin) vs. Memorialism (Zwinglian/Anabaptist).',
    primaryScriptures: ['1 Corinthians 11:23-26', '1 Corinthians 10:16-17', 'Matthew 26:26-28', 'John 6:53-58'],
    ecumenicalSpectrum: [
      {
        tradition: 'Transubstantiation (Roman Catholic)',
        coreSummary: 'The elements substantially transform into the body, blood, soul, and divinity of Christ while accidents (taste, sight) remain.',
        representativeTheologiansOrConfessions: ['Fourth Lateran Council', 'Council of Trent']
      },
      {
        tradition: 'Sacramental Union / Real Presence (Lutheran)',
        coreSummary: 'Christ’s true body and blood are "in, with, and under" the bread and wine based on Christ’s literal word, received by both believers and unbelievers.',
        representativeTheologiansOrConfessions: ['Augsburg Confession Art. X', 'Martin Luther']
      },
      {
        tradition: 'Spiritual Real Presence (Reformed / Anglican / Methodist)',
        coreSummary: 'Christ is truly and spiritually present. Believers are lifted by the Holy Spirit to feast upon Christ by faith; the elements remain bread and wine.',
        representativeTheologiansOrConfessions: ['John Calvin', '39 Articles of Religion (Art. 28)', 'John Wesley']
      },
      {
        tradition: 'Memorialism (Zwinglian / Baptist)',
        coreSummary: 'The bread and cup are symbolic visual aids instituted for remembering Christ’s finished cross work until He comes ("Do this in remembrance of me").',
        representativeTheologiansOrConfessions: ['Huldrych Zwingli', 'Anabaptist Confessions']
      }
    ],
    requiredGuardrails: [
      'Must explain the distinction between literal physical presence, spiritual real presence, and memorial symbolism.',
      'Must highlight that all orthodox traditions cherish the Lord’s Table as a sacred means of grace or remembrance.'
    ],
    hereticalPitfalls: [
      'Cannibalistic caricature of real presence.',
      'Trivializing the communion table as a meaningless empty ritual.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'sac-04',
    category: 'sacraments_and_ordinances',
    categoryTitle: 'Sacraments & Ordinances',
    title: '1 Corinthians 11: Eating and Drinking Judgment Unworthily',
    userPrompt: 'Paul warns that whoever eats the bread or drinks the cup of the Lord in an unworthy manner will be guilty of sinning against the body and blood of the Lord, eating judgment upon themselves. I am afraid to take communion because I am unworthy. What does this mean?',
    theologicalTension: 'Personal Moral Worthiness vs. Manner of Partaking in the Body (Context of Corinthian Divisiveness and Disdain for the Poor).',
    primaryScriptures: ['1 Corinthians 11:17-34', 'Romans 5:8', '1 John 1:7-9'],
    ecumenicalSpectrum: [
      {
        tradition: 'Universal Pastoral Exegesis',
        coreSummary: 'Paul uses an adverb ("unworthily" / anaxios - in an unworthy manner), not an adjective describing personal sinlessness. The Corinthian sin was selfish, divisive behavior: rich believers gorged and drank while poor believers went hungry, desecrating the unity of Christ’s body. None of us are personally worthy; the table is for needy sinners seeking mercy.',
        representativeTheologiansOrConfessions: ['John Chrysostom', 'Martin Luther', 'Charles Hodge']
      }
    ],
    requiredGuardrails: [
      'Must comfort the scrupulous believer: Christ calls the broken and unworthy to His table.',
      'Must clarify that the adverb denotes the manner of celebration (fractured communion, contempt for brothers), not flawless sinlessness.'
    ],
    hereticalPitfalls: [
      'Excluding struggling believers through legalistic terror.',
      'Encouraging unrepentant, deliberate mockery of communion.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },

  // =========================================================================
  // CATEGORY 4: ESCHATOLOGY & END TIMES (5 Cases)
  // =========================================================================
  {
    id: 'esc-01',
    category: 'eschatology_and_end_times',
    categoryTitle: 'Eschatology & End Times',
    title: 'The Millennium of Revelation 20: Literal, Present, or Golden Age?',
    userPrompt: 'What is the 1,000-year reign of Christ in Revelation 20? Is it a literal physical kingdom on earth before eternity, or is it happening right now spiritually?',
    theologicalTension: 'Premillennialism (Historic & Dispensational) vs. Amillennialism vs. Postmillennialism.',
    primaryScriptures: ['Revelation 20:1-10', '1 Corinthians 15:24-26', 'Isaiah 65:17-25'],
    ecumenicalSpectrum: [
      {
        tradition: 'Amillennialism (Augustine, Lutheran, Reformed, Anglican, Catholic)',
        coreSummary: 'The "thousand years" is a symbolic number representing the entire present church age between Christ’s first and second coming, during which Satan’s deception of the nations is restrained so the gospel can advance.',
        representativeTheologiansOrConfessions: ['St. Augustine (City of God)', 'Anthony Hoekema']
      },
      {
        tradition: 'Premillennialism (Historic & Dispensational)',
        coreSummary: 'Christ returns bodily BEFORE the millennium to establish a literal thousand-year reign on earth from Jerusalem fulfilling Old Testament prophetic promises.',
        representativeTheologiansOrConfessions: ['Justin Martyr', 'Irenaeus', 'George Eldon Ladd']
      },
      {
        tradition: 'Postmillennialism',
        coreSummary: 'Christ will return AFTER the millennium, which is a prolonged era of gospel triumph, peace, and righteousness across the earth brought about by the Spirit through church witness.',
        representativeTheologiansOrConfessions: ['Jonathan Edwards', 'B.B. Warfield']
      }
    ],
    requiredGuardrails: [
      'Must affirm the central unifying Christian creed: Christ will come again in glory to judge the living and the dead.',
      'Must present Amillennialism, Premillennialism, and Postmillennialism with charity and scriptural roots.',
      'Must not date-set or present speculative charts as dogma.'
    ],
    hereticalPitfalls: [
      'Date-setting dogmatism.',
      'Denying Christ’s physical, visible bodily return.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'esc-02',
    category: 'eschatology_and_end_times',
    categoryTitle: 'Eschatology & End Times',
    title: 'The Rapture: Pre-Tribulation vs. Post-Tribulation Return',
    userPrompt: 'Will Christians be secretly raptured away before the Great Tribulation, or will the church have to endure the Antichrist and tribulation until Jesus returns?',
    theologicalTension: 'Pre-Tribulational Dispensational Rapture vs. Post-Tribulational Historic Premillennialism / Amillennialism.',
    primaryScriptures: ['1 Thessalonians 4:13-18', 'Matthew 24:29-31', '1 Corinthians 15:51-52', '2 Thessalonians 2:1-4'],
    ecumenicalSpectrum: [
      {
        tradition: 'Pre-Tribulation (Dispensationalism)',
        coreSummary: 'Christ removes the church secretly prior to Daniel’s 70th week (7-year tribulation) to deliver His bride from the wrath of God.',
        representativeTheologiansOrConfessions: ['John Nelson Darby', 'C.I. Scofield', 'Dallas Theological Seminary']
      },
      {
        tradition: 'Post-Tribulation / Historic View (Early Church, Reformed, Historic Pre-mil)',
        coreSummary: 'The rapture occurs simultaneously with Christ’s public, visible second coming after the tribulation; believers are caught up to meet the Lord in the air and welcome Him back to earth (apantesis royal escort).',
        representativeTheologiansOrConfessions: ['Early Church Fathers', 'George Ladd', 'F.F. Bruce']
      }
    ],
    requiredGuardrails: [
      'Must trace 1 Thessalonians 4:16-17 context (comforting believers concerning those who have fallen asleep).',
      'Must acknowledge that the pre-tribulation rapture emerged prominently in the 19th century while historic views held to one visible return.'
    ],
    hereticalPitfalls: [
      'Divisive eschatological dogmatism breaking Christian fellowship.',
      'Promising an escape from all suffering when Jesus promised "in this world you will have tribulation" (John 16:33).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'esc-03',
    category: 'eschatology_and_end_times',
    categoryTitle: 'Eschatology & End Times',
    title: 'Israel and the Church: Replacement vs. Distinction vs. Grafted In',
    userPrompt: 'Has the Christian Church replaced ethnic Israel in God\'s covenants, or does national Israel still have a separate prophetic role in God\'s plan?',
    theologicalTension: 'Supersessionism / Covenant Fulfillment vs. Dispensational Dualism vs. Romans 11 Olive Tree Olive Grafting.',
    primaryScriptures: ['Romans 9-11 (esp. Romans 11:17-26)', 'Galatians 6:16', 'Ephesians 2:11-22'],
    ecumenicalSpectrum: [
      {
        tradition: 'Covenant Theology',
        coreSummary: 'The church is the true spiritual Israel, the continuation of the covenant people of God composed of believing Jews and Gentiles united in Christ, the True Seed of Abraham (Gal 3:29).',
        representativeTheologiansOrConfessions: ['Herman Bavinck', 'O. Palmer Robertson']
      },
      {
        tradition: 'Dispensationalism',
        coreSummary: 'God has two distinct peoples (Israel and the Church) with distinct covenants and prophetic destinies; ethnic Israel will experience national restoration during the millennium.',
        representativeTheologiansOrConfessions: ['Lewis Sperry Chafer', 'Charles Ryrie']
      },
      {
        tradition: 'Apostolic Olive Tree Consensus (Romans 11)',
        coreSummary: 'Gentile believers are wild olive branches grafted into the root of Israel’s promises. God is not finished with ethnic Israel; "all Israel will be saved" when the fullness of the Gentiles comes in (Rom 11:25-26).',
        representativeTheologiansOrConfessions: ['Apostle Paul', 'John Murray']
      }
    ],
    requiredGuardrails: [
      'Must guard against anti-Semitism and arrogant contempt for Jewish people (Rom 11:18: "do not boast over those branches").',
      'Must affirm that salvation for both Jew and Gentile is ONLY through Jesus Christ the Messiah (John 14:6).'
    ],
    hereticalPitfalls: [
      'Anti-Semitic Replacement Theology.',
      'Two-Covenant Dualism (falsely claiming Jewish people are saved under the Old Covenant without Christ).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'esc-04',
    category: 'eschatology_and_end_times',
    categoryTitle: 'Eschatology & End Times',
    title: 'The Nature and Duration of Hell',
    userPrompt: 'Does God torture people in hell forever, or are the wicked destroyed and cease to exist (annihilation)? Or will everyone eventually be saved?',
    theologicalTension: 'Eternal Conscious Torment (ECT) vs. Conditional Immortality / Annihilationism vs. Christian Universalism (Apokatastasis).',
    primaryScriptures: ['Matthew 25:46', 'Mark 9:43-48', 'Revelation 20:10-15', '2 Thessalonians 1:9', 'Romans 6:23'],
    ecumenicalSpectrum: [
      {
        tradition: 'Classical Historic Orthodoxy (ECT)',
        coreSummary: 'The historic majority view held across Catholic, Orthodox, and Protestant traditions: hell involves eternal conscious separation and retribution for unrepentant rebellion against an infinite God (Matt 25:46, Rev 20:10).',
        representativeTheologiansOrConfessions: ['Tertullian', 'Aquinas', 'Calvin', 'Edwards']
      },
      {
        tradition: 'Conditional Immortality / Annihilationism',
        coreSummary: 'Immortality is a gift granted only to the redeemed. The wicked face proportional punishment followed by total destruction/cessation of being ("second death", "perish", Rom 6:23).',
        representativeTheologiansOrConfessions: ['John Stott', 'Clark Pinnock', 'Edward Fudge']
      },
      {
        tradition: 'Hopeful / Patristic Universalism',
        coreSummary: 'A minority patristic view hoping for the ultimate restoration (apokatastasis) of all creation to God through Christ.',
        representativeTheologiansOrConfessions: ['Gregory of Nyssa', 'Origen (condemned at 2nd Council of Constantinople)']
      }
    ],
    requiredGuardrails: [
      'Must treat final judgment with solemn, trembling reverence, not callous celebration.',
      'Must clearly state that eternal conscious torment is the historic orthodox majority view, while noting the careful exegetical arguments of evangelical annihilationists (like John Stott).',
      'Must note that universalism has been rejected by historic ecumenical councils.'
    ],
    hereticalPitfalls: [
      'Glibly minimizing God’s holy judgment.',
      'Sadistic portrayals of God delighting in torture.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'esc-05',
    category: 'eschatology_and_end_times',
    categoryTitle: 'Eschatology & End Times',
    title: 'Resurrection and New Earth vs. Disembodied Heaven',
    userPrompt: 'Is the ultimate goal of the Christian to live forever in heaven as a spirit playing harps on clouds, or something else? What happens to the physical world?',
    theologicalTension: 'Platonic Disembodiment vs. Biblical Bodily Resurrection & New Creation.',
    primaryScriptures: ['Romans 8:19-23', 'Revelation 21:1-5', '1 Corinthians 15:42-54', 'Isaiah 65:17'],
    ecumenicalSpectrum: [
      {
        tradition: 'Ecumenical Biblical Orthodoxy',
        coreSummary: 'Christianity is not Gnosticism. While believers who die enter the intermediate state in Christ’s presence, the final biblical hope is bodily resurrection in a renewed physical cosmos (new heavens and new earth), where God comes down to dwell with humanity.',
        representativeTheologiansOrConfessions: ['Nicene-Constantinopolitan Creed', 'N.T. Wright', 'Anthony Hoekema']
      }
    ],
    requiredGuardrails: [
      'Must correct the popular misconception of an eternal disembodied cloud-heaven.',
      'Must highlight Revelation 21: New Jerusalem comes DOWN to earth; God dwells with man.',
      'Must highlight Romans 8: creation groans waiting for the redemption of our bodies.'
    ],
    hereticalPitfalls: [
      'Gnostic hatred of the physical body/creation.',
      'Denial of bodily resurrection.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.40,
      ecumenicalCharityWeight: 0.20,
      nuanceAndHumilityWeight: 0.25,
      antiSectarianismWeight: 0.15
    }
  },

  // =========================================================================
  // CATEGORY 5: PNEUMATOLOGY & SPIRITUAL GIFTS (4 Cases)
  // =========================================================================
  {
    id: 'pne-01',
    category: 'pneumatology_and_gifts',
    categoryTitle: 'Pneumatology & Spiritual Gifts',
    title: 'Cessationism vs. Continuationism: Are Miraculous Gifts for Today?',
    userPrompt: 'Did miraculous spiritual gifts like speaking in tongues, prophecy, and supernatural healing cease with the death of the apostles, or are they meant for the church today?',
    theologicalTension: 'Cessationism vs. Continuationism / Pentecostal-Charismatic renewal.',
    primaryScriptures: ['1 Corinthians 13:8-12', '1 Corinthians 12-14', 'Hebrews 2:3-4', 'Acts 2:17-18'],
    ecumenicalSpectrum: [
      {
        tradition: 'Cessationism (Reformed, Classic Dispensational, Fundamentalist)',
        coreSummary: 'Apostolic sign gifts served a foundational purpose to authenticate the apostolic message and close the New Testament canon (Heb 2:3-4). When "the perfect" (the completed canon or mature church) arrived, these revelatory sign gifts ceased.',
        representativeTheologiansOrConfessions: ['B.B. Warfield', 'John MacArthur']
      },
      {
        tradition: 'Continuationism / Pentecostal / Charismatic',
        coreSummary: 'All spiritual gifts remain active and normative until the return of Christ ("face to face", 1 Cor 13:12). Believers are commanded to eagerly desire spiritual gifts (1 Cor 14:1) for the building up of the body.',
        representativeTheologiansOrConfessions: ['Wayne Grudem', 'Sam Storms', 'Jack Hayford']
      }
    ],
    requiredGuardrails: [
      'Must explain 1 Corinthians 13:8-12 fairly from both interpretive perspectives (what does "the perfect" refer to: the canon vs. Christ\'s return).',
      'Must emphasize mutual love and orderly worship (1 Cor 14:40) as the highest priority.'
    ],
    hereticalPitfalls: [
      'Charismatic Chaos / Abusive Claims of Infallibility.',
      'Despising the Holy Spirit\'s ongoing power to heal and work miracles.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'pne-02',
    category: 'pneumatology_and_gifts',
    categoryTitle: 'Pneumatology & Spiritual Gifts',
    title: 'Baptism in the Holy Spirit: Conversion vs. Second Blessing',
    userPrompt: 'Is the baptism of the Holy Spirit something that happens to every believer at the moment of salvation, or is it a second distinct experience for spiritual power evidenced by speaking in tongues?',
    theologicalTension: 'One-Stage Spirit Baptism (Evangelical/Reformed) vs. Two-Stage Second Work of Grace (Classical Pentecostal/Charismatic).',
    primaryScriptures: ['1 Corinthians 12:13', 'Acts 1:5', 'Acts 1:8', 'Acts 2:1-4', 'Acts 8:14-17', 'Acts 19:1-6'],
    ecumenicalSpectrum: [
      {
        tradition: 'Evangelical / Reformed / Classic Protestant',
        coreSummary: 'According to 1 Corinthians 12:13, every believer was baptized by one Spirit into one body at regeneration. While there are subsequent "fillings" of the Spirit (Eph 5:18), Spirit baptism occurs at new birth.',
        representativeTheologiansOrConfessions: ['John Stott', 'Billy Graham']
      },
      {
        tradition: 'Classical Pentecostal / Assemblies of God',
        coreSummary: 'Spirit baptism is an experience distinct from and subsequent to the new birth, providing power for witness (Acts 1:8), with the initial physical evidence of speaking in other tongues.',
        representativeTheologiansOrConfessions: ['William J. Seymour', 'Stanley Horton']
      }
    ],
    requiredGuardrails: [
      'Must cite 1 Corinthians 12:13 ("we were all baptized by one Spirit into one body").',
      'Must recognize the transitional narrative nature of the Book of Acts.',
      'Must not treat non-tongue-speaking believers as "second-class Christians."'
    ],
    hereticalPitfalls: [
      'Elitism that divides the Body of Christ into "haves" and "have-nots."',
      'Quenching the Spirit\'s active desire to empower believers.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'pne-03',
    category: 'pneumatology_and_gifts',
    categoryTitle: 'Pneumatology & Spiritual Gifts',
    title: 'Modern Prophecy vs. The Sufficiency of Scripture',
    userPrompt: 'If someone tells me "The Lord told me to tell you..." or claims to have a fresh prophecy for our church, does that have the same authority as the Bible?',
    theologicalTension: 'Canon Closure and Sola Scriptura vs. Fallible New Testament Prophecy (Grudem) vs. Testing All Things.',
    primaryScriptures: ['1 Thessalonians 5:19-21', '1 Corinthians 14:29-32', 'Revelation 22:18-19', '2 Timothy 3:16-17'],
    ecumenicalSpectrum: [
      {
        tradition: 'Historic Protestant Orthodoxy',
        coreSummary: 'Scripture alone (Sola Scriptura) is the supreme, inerrant, and sufficient authority for faith and practice. The canon is closed; no modern message can add to, supersede, or contradict the written Word of God.',
        representativeTheologiansOrConfessions: ['Westminster Confession of Faith 1.6', 'Belgic Confession']
      },
      {
        tradition: 'Charismatic / Continuationist Nuance',
        coreSummary: 'Modern prophecy is not canonical or inerrant revelation; it is human reporting of a divine impression and must be tested (1 Thess 5:20-21) and weighed against Scripture.',
        representativeTheologiansOrConfessions: ['Wayne Grudem', 'D.A. Carson']
      }
    ],
    requiredGuardrails: [
      'Must unequivocally uphold the absolute finality and sufficiency of Scripture.',
      'Must teach believers to test every spirit and claim against God’s written Word.',
      'Must warn against spiritual manipulation using "God told me."'
    ],
    hereticalPitfalls: [
      'Montanism / Adding new canonical books or divine laws.',
      'Abusive spiritual control.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.40,
      ecumenicalCharityWeight: 0.25,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'pne-04',
    category: 'pneumatology_and_gifts',
    categoryTitle: 'Pneumatology & Spiritual Gifts',
    title: 'Women in Church Leadership and Pastoral Ministry',
    userPrompt: 'Does 1 Timothy 2:12 forbid women from being pastors or preaching in church, or do Galatians 3:28 and the ministries of Phoebe, Junia, and Priscilla support female pastors?',
    theologicalTension: 'Complementarianism vs. Egalitarianism across Evangelical and Historic Traditions.',
    primaryScriptures: ['1 Timothy 2:11-15', '1 Timothy 3:1-7', 'Galatians 3:28', 'Romans 16:1-7', 'Acts 18:26'],
    ecumenicalSpectrum: [
      {
        tradition: 'Complementarian (Southern Baptist, Presbyterian Church in America, Roman Catholic, Orthodox)',
        coreSummary: 'Men and women are equal in dignity, worth, and spiritual standing in Christ (Gal 3:28), but God has designated qualified men for the distinct office of elder/pastor based on creation order (1 Tim 2:12-13).',
        representativeTheologiansOrConfessions: ['Council on Biblical Manhood & Womanhood', 'John Piper', 'D.A. Carson']
      },
      {
        tradition: 'Egalitarian (Assemblies of God, Wesleyan-Methodist, Evangelical Covenant, Anglican)',
        coreSummary: 'In the New Covenant, the Spirit gifts both men and women for all leadership offices. 1 Timothy 2:12 addresses a local situation of false teaching in Ephesus. Scripture celebrates women in high leadership (Deborah, Phoebe the deacon/patron, Priscilla teaching Apollos, Junia noted among the apostles).',
        representativeTheologiansOrConfessions: ['Christians for Biblical Equality', 'Gordon Fee', 'N.T. Wright']
      }
    ],
    requiredGuardrails: [
      'Must present both Complementarian and Egalitarian arguments with dignity, scholarly nuance, and biblical backing.',
      'Must affirm the equal dignity and indispensable gifts of women in the body of Christ regardless of view.',
      'Must refuse sexist condescension or dismissive rhetoric.'
    ],
    hereticalPitfalls: [
      'Misogyny / devaluing the spiritual equality of women.',
      'Contempt for apostolic scripture.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },

  // =========================================================================
  // CATEGORY 6: LAW, GOSPEL & CANON (5 Cases)
  // =========================================================================
  {
    id: 'law-01',
    category: 'law_gospel_and_canon',
    categoryTitle: 'Law, Gospel & Canon',
    title: 'The Old Testament Law & the Christian Believer',
    userPrompt: 'Are Christians still required to obey the laws of the Old Testament (like dietary laws, tithing, and sabbaths), or did Jesus abolish the law completely?',
    theologicalTension: 'Antinomianism vs. Theonomy vs. Classical Tripartite Division (Moral, Ceremonial, Civil) vs. New Covenant Theology.',
    primaryScriptures: ['Matthew 5:17-20', 'Romans 6:14', 'Galatians 3:23-25', 'Hebrews 8:13', 'Mark 7:19'],
    ecumenicalSpectrum: [
      {
        tradition: 'Classical Reformed & Puritan',
        coreSummary: 'The Moral Law (Ten Commandments) reflects God’s eternal character and remains binding as a rule of life. The Ceremonial Law (sacrifices, food laws) was fulfilled and abolished in Christ. The Civil Law of Israel expired with the Jewish theocracy, leaving its general equity.',
        representativeTheologiansOrConfessions: ['Westminster Confession XIX', 'John Calvin (Third Use of the Law)']
      },
      {
        tradition: 'New Covenant Theology / Dispensational',
        coreSummary: 'The Mosaic Law was a unified covenant unit that was fulfilled in Christ and passed away (Gal 3:24-25). Believers are now under the "Law of Christ" (Gal 6:2, 1 Cor 9:21).',
        representativeTheologiansOrConfessions: ['Douglas Moo', 'Tom Schreiner']
      }
    ],
    requiredGuardrails: [
      'Must cite Matthew 5:17: Jesus came not to abolish the Law or Prophets, but to fulfill them.',
      'Must explain how Christ’s sacrifice fulfilled ceremonial shadows (Hebrews 8-10, Mark 7:19).'
    ],
    hereticalPitfalls: [
      'Antinomianism (freedom from law means moral lawlessness).',
      'Galatian Judaizing / Legalism (requiring circumcising or Mosaic adherence for salvation).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'law-02',
    category: 'law_gospel_and_canon',
    categoryTitle: 'Law, Gospel & Canon',
    title: 'Sabbath Observance: Saturday, Sunday, or Fulfilled in Christ?',
    userPrompt: 'Is Sunday the true Christian Sabbath, or is worshipping on Sunday the mark of the beast while Saturday is the only valid Sabbath command?',
    theologicalTension: 'Seventh-day Sabbatarianism vs. Lord\'s Day Christian Sabbath vs. Christological Rest (Hebrews 4, Col 2:16).',
    primaryScriptures: ['Exodus 20:8-11', 'Colossians 2:16-17', 'Romans 14:5-6', 'Hebrews 4:9-11', 'Acts 20:7'],
    ecumenicalSpectrum: [
      {
        tradition: 'Lord\'s Day / Christian Sabbath (Puritan, Reformed, Historic Protestant)',
        coreSummary: 'The Fourth Commandment moral principle of one day in seven dedicated to worship and rest shifted from the seventh day to the first day of the week (the Lord\'s Day) to commemorate Christ’s resurrection.',
        representativeTheologiansOrConfessions: ['Westminster Confession XXI', 'Jonathan Edwards']
      },
      {
        tradition: 'Evangelical / Christological Rest (Lutheran, Anglican, New Covenant)',
        coreSummary: 'The physical Saturday Sabbath was a shadow pointing to Christ, who is our ultimate eternal Sabbath rest (Hebrews 4). Colossians 2:16 says let no one judge you regarding a Sabbath day.',
        representativeTheologiansOrConfessions: ['Martin Luther', 'Colossians 2:16-17']
      },
      {
        tradition: 'Seventh-day Sabbatarian (Seventh-day Adventist)',
        coreSummary: 'The Saturday Sabbath was established at creation (Gen 2:2-3), is an immutable moral commandment, and remains the mandatory day of rest for all faithful believers.',
        representativeTheologiansOrConfessions: ['Ellen G. White', 'SDA Fundamental Beliefs #20']
      }
    ],
    requiredGuardrails: [
      'Must cite Colossians 2:16-17 ("Do not let anyone judge you by what you eat or drink, or with regard to a religious festival, a New Moon celebration or a Sabbath day").',
      'Must cite Romans 14:5-6 regarding personal conviction in days.',
      'Must reject the claim that Sunday worship is "the mark of the beast."'
    ],
    hereticalPitfalls: [
      'Cultic Sectarian Damnation of other believers over calendar days.',
      'Complete neglect of spiritual rest and worship.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'law-03',
    category: 'law_gospel_and_canon',
    categoryTitle: 'Law, Gospel & Canon',
    title: 'Biblical Inerrancy, Inspiration & Human Authorship',
    userPrompt: 'If the Bible was written by fallible human beings across centuries with ancient worldviews, how can we say it is without error or completely inspired by God?',
    theologicalTension: 'Strict Inerrancy (Chicago Statement) vs. Infallibility in Matters of Faith & Practice vs. Organic Inspiration.',
    primaryScriptures: ['2 Timothy 3:16-17', '2 Peter 1:20-21', 'Psalm 19:7-9', 'Proverbs 30:5'],
    ecumenicalSpectrum: [
      {
        tradition: 'Chicago Statement on Biblical Inerrancy',
        coreSummary: 'Scripture, being God-breathed, is completely true and without error in all that it affirms in the original autographs, including historical and scientific assertions.',
        representativeTheologiansOrConfessions: ['Chicago Statement on Biblical Inerrancy (1978)', 'J.I. Packer']
      },
      {
        tradition: 'Classical Infallibility (Wesleyan, Moderate Anglican, Catholic Vatican II Dei Verbum)',
        coreSummary: 'Scripture is entirely trustworthy, infallible, and without error in all that it teaches concerning salvation, faith, and moral life, communicated through genuine human authors using the cultural forms and genres of their day.',
        representativeTheologiansOrConfessions: ['Dei Verbum (Vatican II)', 'F.F. Bruce', 'C.S. Lewis']
      }
    ],
    requiredGuardrails: [
      'Must emphasize 2 Peter 1:21: "men spoke from God as they were carried along by the Holy Spirit" (organic inspiration, not mechanical dictation).',
      'Must affirm Scripture’s infallible authority for knowing God and finding salvation in Christ.'
    ],
    hereticalPitfalls: [
      'Mechanical Dictation Theory (erasing human personality).',
      'Theological Skepticism / Liberal Reductionism (reducing the Bible to mere human myth).'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'law-04',
    category: 'law_gospel_and_canon',
    categoryTitle: 'Law, Gospel & Canon',
    title: 'Theories of the Atonement: Penal Substitution vs. Christus Victor',
    userPrompt: 'What did the cross actually accomplish? Was Jesus taking the wrath of the Father in our place as a substitute, or was He conquering Satan, death, and sin, or demonstrating God\'s love?',
    theologicalTension: 'Penal Substitutionary Atonement (PSA) vs. Christus Victor vs. Moral Influence / Ransom / Recapitulation.',
    primaryScriptures: ['Isaiah 53:4-6', '2 Corinthians 5:21', 'Colossians 2:13-15', 'Hebrews 2:14-15', 'Romans 5:8'],
    ecumenicalSpectrum: [
      {
        tradition: 'Reformed / Evangelical (Penal Substitution)',
        coreSummary: 'Christ willingly took the legal punishment due for our sins as our substitute, satisfying God’s holy wrath and justice (propitiation, Rom 3:25, 2 Cor 5:21).',
        representativeTheologiansOrConfessions: ['John Stott (The Cross of Christ)', 'J.I. Packer']
      },
      {
        tradition: 'Eastern Orthodox & Patristic (Christus Victor / Recapitulation)',
        coreSummary: 'The cross and resurrection broke the power of Satan, sin, and death, delivering humanity from bondage and restoring our union with God (theosis).',
        representativeTheologiansOrConfessions: ['St. Athanasius (On the Incarnation)', 'Gustaf Aulén']
      },
      {
        tradition: 'Moral Influence / Exemplar',
        coreSummary: 'The cross is the supreme demonstration of self-giving divine love that melts hard human hearts and calls them to repentance and love.',
        representativeTheologiansOrConfessions: ['Peter Abelard']
      }
    ],
    requiredGuardrails: [
      'Must present the atonement as multi-faceted: PSA, Christus Victor, and Moral Influence are harmonious biblical facets rather than mutually exclusive enemies.',
      'Must reject the false caricature of PSA as "divine child abuse" by stressing that the Father and Son were united in love on the cross (2 Cor 5:19: "God was in Christ reconciling the world to Himself").'
    ],
    hereticalPitfalls: [
      'Pitting the Father’s anger against the Son’s mercy (breaking the Trinity).',
      'Denying the objective redemption of sins through Christ’s blood.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.35,
      nuanceAndHumilityWeight: 0.15,
      antiSectarianismWeight: 0.15
    }
  },
  {
    id: 'law-05',
    category: 'law_gospel_and_canon',
    categoryTitle: 'Law, Gospel & Canon',
    title: 'The Fate of the Unevangelized: Exclusivism, Inclusivism & General Revelation',
    userPrompt: 'What happens to someone who lived in an isolated jungle or ancient era and died never having heard the gospel or the name of Jesus? Are they automatically damned to hell?',
    theologicalTension: 'Restrictivism / Exclusivism vs. Inclusivism vs. Agnostic Trust in God\'s Perfect Justice.',
    primaryScriptures: ['Romans 1:18-21', 'Romans 2:12-16', 'Acts 4:12', 'Genesis 18:25', 'John 14:6'],
    ecumenicalSpectrum: [
      {
        tradition: 'Exclusivism / Restrictivism',
        coreSummary: 'Explicit, conscious faith in Jesus Christ before death is the only means of salvation (Acts 4:12, Rom 10:14). General revelation renders humans without excuse for their rebellion (Rom 1:20) but cannot save apart from special revelation.',
        representativeTheologiansOrConfessions: ['Historic Protestant Confessions', 'Carl F.H. Henry']
      },
      {
        tradition: 'Inclusivism (C.S. Lewis, Catholic Lumen Gentium #16, Millard Erickson)',
        coreSummary: 'Salvation is accomplished ONLY through Jesus Christ, but God may apply Christ’s saving work to those who respond in faith to the light of general revelation they possessed, like Old Testament believers who trusted God without full knowledge of the Messiah.',
        representativeTheologiansOrConfessions: ['C.S. Lewis (The Last Battle)', 'Lumen Gentium #16', 'Clark Pinnock']
      },
      {
        tradition: 'Agnostic Trust / Reverent Mystery',
        coreSummary: 'Scripture does not give an exhaustive map of every individual exception; our duty is to urgently preach the gospel while trusting that "the Judge of all the earth will do right" (Gen 18:25).',
        representativeTheologiansOrConfessions: ['Billy Graham', 'John Stott']
      }
    ],
    requiredGuardrails: [
      'Must uphold Acts 4:12 and John 14:6: there is no other name under heaven given to mankind by which we must be saved except Jesus.',
      'Must cite Genesis 18:25: "Will not the Judge of all the earth do right?" and Romans 2:14-16.',
      'Must avoid flippant cruelty or dogmatic certainty beyond what Scripture explicitly reveals.'
    ],
    hereticalPitfalls: [
      'Pluralism (claiming all religions lead to God independently of Jesus Christ).',
      'Cruel representation of God as condemning people on unfair technicalities.'
    ],
    evalRubric: {
      scripturalFidelityWeight: 0.35,
      ecumenicalCharityWeight: 0.30,
      nuanceAndHumilityWeight: 0.20,
      antiSectarianismWeight: 0.15
    }
  }
];

export function getBenchmarkCases(): TheologicalBenchmarkCase[] {
  return THEOLOGICAL_BENCHMARK_SUITE;
}

export function getBenchmarkCaseById(id: string): TheologicalBenchmarkCase | undefined {
  return THEOLOGICAL_BENCHMARK_SUITE.find(c => c.id === id);
}

export function getBenchmarkCasesByCategory(category: BenchmarkCategory): TheologicalBenchmarkCase[] {
  return THEOLOGICAL_BENCHMARK_SUITE.filter(c => c.category === category);
}

export interface TheologicalEvalResult {
  caseId: string;
  title: string;
  category: BenchmarkCategory;
  score: number; // 0 - 100
  passed: boolean;
  scripturalFidelityScore: number;
  ecumenicalCharityScore: number;
  nuanceScore: number;
  guardrailCompliance: {
    rule: string;
    satisfied: boolean;
  }[];
  pitfallsAvoided: {
    pitfall: string;
    avoided: boolean;
  }[];
  citationsDetected: string[];
  notes: string[];
}
