<template>
  <BaseSheet3 :character="gub"/>
</template>

<script setup>
import BaseSheet3 from 'components/BaseSheet';
import { reactive } from 'vue';

const gub = reactive({
  introduction: {
    name: 'gub the great',
    heritage: 'monkey goblin',
    heritageTraits: [
      {
        name: 'Gublin!',
        bonusType: 'racial',
        bonus: {
          acrobatics: 2,
          stealth: 2,
        },
      },
      {
        name: 'Oblivious',
        bonusType: 'racial',
        bonus: {
          'sense motive': -2,
          perception: -2,
        },
      },
    ],
    traits: [
      'oblivious',
      'less effort',
      'auspicious tattoo',
      'advantageous distraction',
      'reactionary',
      'fate\'s favored',
    ],
    class: [{
      archetype: ['brown-fur transmuter'],
      name: 'arcanist',
      level: 11,
      hitDie: 6,
      bab: 1 / 2,
      first: true,
      skillRanks: 2,
      classSkills: ['appraise', 'craft', 'fly', 'knowledge', 'lingustics', 'profession', 'spellcraft', 'use magic device'],
      favored: {
        hp: 11,
        skill: 0,
        race: {
          'monkey goblin': 0,
        },
      },
      saves: {
        fort: false,
        ref: false,
        will: true,
      },
      spells: {
        '5th': {
          slots: 4,
          prepared: [
            'Teleport',
            'monstrous physique III',
          ],
        },
        '4th': {
          slots: 5,
          prepared: [
            'remove curse',
            'dimension door',
            'phantom chariot',
          ],
        },
        '3rd': {
          slots: 5,
          prepared: [
            'haste',
            'fly',
            'heroism',
            'disable construct',
          ],
        },
        '2nd': {
          slots: 5,
          prepared: [
            'cat\'s grace',
            'bull\'s strength',
            'blur',
            'mirror image',
            'false life',
          ],
        },
        '1st': {
          slots: 6,
          prepared: [
            'enlarge person',
            'reduce person',
            'mage armor',
            'shield',
            'mindlink',
          ],
        },
        Cantrips: {
          prepared: [
            'read magic',
            'detect magic',
            'mage hand',
            'light',
            'acid splash',
            'ghost sound',
            'message',
            'sotto voce',
          ],
        },

      },
      casterLevel: 11,
      castingStat: 'intelligence',
      casting: 'prepared',
    }],
    alignment: 'N',
    size: 'small',
    sizeMod: 1,
    type: 'humanoid',
    subtype: ['goblinoid'],
    senses: ['low-light vision'],
    aura: '',
  },
  defense: {
    defensiveAbilities: '',
    dr: '',
    immune: '',
    resist: '',
    sr: '',
    weaknesses: '',
    saveAbilityScore: {
      fortitude: 'constitution',
      reflex: 'dexterity',
      will: 'wisdom',
    },
  },
  offense: {
    speed: 20,
    space: 5,
    reach: 5,
    specialAttacks: [
      {
        name: 'Arcane Reservoir',
        ranks: 0,
      },
      {
        name: 'Arcanist Exploits',
        exploits: [
          'item crafting',
          'quick study',
          'dimensional slide',
        ],
      },
    ],
    spellLikeAbilities: '',
    melee: [
      {
        name: 'cestus',
        weaponGroup: 'light',
        attack: 0,
        dieCount: 1,
        dieSize: 4,
        damage: 0,
      },
    ],
    ranged: [
      {
        name: 'Goblinbone Longbow',
        attack: 1,
        dieCount: 1,
        dieSize: 6,
        damage: 1,
      },
    ],
  },
  tactics: '',
  statistics: {
    abilityScore: {
      strength: {
        pointBuy: 16,
      },
      dexterity: {
        pointBuy: 17,
        racial: 4,

      },
      constitution: {
        pointBuy: 9,
      },
      intelligence: {
        pointBuy: 13,
        levelUp: 1,
      },
      wisdom: {
        pointBuy: 6,
        racial: -2,
      },
      charisma: {
        pointBuy: 11,
        levelUp: 1,
      },
    },
    feats: [
      'additional traits',
      'craft wondrous item',
      'craft construct',
      'leadership (13)',
      // 'precise shot',
      // 'weapon focus (longbow)',
      // 'favored prestige class',
      // 'prestigous spellcaster',
      // 'rapidshot',
      // 'manyshot',
      // 'prestigous spellcaster',
      // 'arrow storm',
    ],
    skills: {
      acrobatics: {
        ranks: 11,
        ability: 'dexterity',
      },
      appraise: {
        ranks: 0,
        ability: 'intelligence',
      },
      bluff: {
        ranks: 0,
        ability: 'charisma',
      },
      climb: {
        ranks: 0,
        ability: 'strength',
      },
      craft: {
        ranks: 0,
        ability: 'intelligence',
      },
      diplomacy: {
        ranks: 0,
        ability: 'charisma',
      },
      'disable device': {
        ranks: 11,
        ability: 'dexterity',
      },
      disguise: {
        ranks: 0,
        ability: 'charisma',
      },
      'escape artist': {
        ranks: 11,
        ability: 'dexterity',
      },
      fly: {
        ranks: 0,
        ability: 'dexterity',
      },
      'handle animal': {
        ranks: 0,
        ability: 'charisma',
      },
      heal: {
        ranks: 0,
        ability: 'wisdom',
      },
      intimidate: {
        ranks: 0,
        ability: 'charisma',
      },
      knowledge: {
        arcana: {
          ranks: 11,
          ability: 'intelligence',
        },
        dungeoneering: {
          ranks: 1,
          ability: 'intelligence',
        },
        engineering: {
          ranks: 1,
          ability: 'intelligence',
        },
        geography: {
          ranks: 1,
          ability: 'intelligence',
        },
        history: {
          ranks: 1,
          ability: 'intelligence',
        },
        local: {
          ranks: 1,
          ability: 'intelligence',
        },
        nature: {
          ranks: 1,
          ability: 'intelligence',
        },
        nobility: {
          ranks: 1,
          ability: 'intelligence',
        },
        planes: {
          ranks: 1,
          ability: 'intelligence',
        },
        religion: {
          ranks: 1,
          ability: 'intelligence',
        },
      },
      linguistics: {
        ranks: 0,
        ability: 'intelligence',
      },
      perception: {
        ranks: 0,
        ability: 'wisdom',
      },
      perform: {
        ranks: 0,
        ability: 'charisma',
      },
      profession: {
        ranks: 0,
        ability: 'wisdom',
      },
      ride: {
        ranks: 0,
        ability: 'dexterity',
      },
      'sense motive': {
        ranks: 0,
        ability: 'wisdom',
      },
      'slight of hand': {
        ranks: 11,
        ability: 'dexterity',
      },
      spellcraft: {
        ranks: 11,
        ability: 'intelligence',
      },
      stealth: {
        ranks: 11,
        ability: 'dexterity',
      },
      survival: {
        ranks: 0,
        ability: 'wisdom',
      },
      swim: {
        ranks: 0,
        ability: 'strength',
      },
      'use magic device': {
        ranks: 11,
        ability: 'charisma',
      },
    },
    languages: '',
    specialQualities: '',
  },
  specialAbilities: '',
  gear: [
    {
      name: 'Cracked Pale Green Prism',
      bonusType: 'competence bonus',
      cost: 4000,
      bonus: {
        saves: 1,
      },
    },
    {
      name: 'Headband of Vast Intellect +4/+4',
      bonusType: 'enhancement',
      cost: 0,
      bonus: {
        intelligence: 6,
        charisma: 6,
      },
    },
    {
      name: 'Belt of Con +6',
      bonusType: 'enhancement',
      cost: 0,
      bonus: {
        constitution: 6,
      },
    },
    {
      name: 'Cloak of Resistance +5',
      bonusType: 'resistance',
      cost: 25000,
      bonus: {
        saves: 5,
      },
    },
    {
      name: 'Mythril Buckler +5',
      bonusType: 'shield',
      cost: 0,
      bonus: {
        ac: 6,
        ffAC: 6,
      },
    },
    {
      name: 'Ring of Protection +1',

      bonusType: 'deflection',
      cost: 2000,
      bonus: {
        ac: 1,
        ffAC: 1,
        touchAC: 1,
      },
    },
    {
      name: 'Cracked Dusty Rose Prism Ioun Stone',
      bonusType: 'insight',
      cost: 500,
      bonus: {
        initiative: 1,
      },
    },
    {
      name: 'Masterwork Tools (Craft/SpellCraft)',
      bonusType: 'circumstance',
      bonus: {
        craft: 2,
        spellcraft: 2,
      },
    },
  ],
  ecology: '',
  // ecology: {
  //   environment: '',
  //   organization: '',
  //   treasure: '',
  // },
  miscellaneous: '',
  toggle: [

    {
      name: 'Haste',
      bonusType: 'dodge',
      active: false,
      duration: 2,
      bonus: {
        attackRolls: 1,
        reflex: 1,
        ac: 1,
        touchAC: 1,
      },
    }, {
      name: 'Mage Armor',
      bonusType: 'armor',
      active: true,
      duration: 0,
      bonus: {
        ac: 4,
        ffAC: 4,

      },
    }, {
      name: 'C-4PO\'s Skin',
      bonusType: 'naturalArmorEnhancement',
      active: true,
      duration: 0,
      bonus: {
        ac: 4,
        ffAC: 4,
      },
    }, {
      name: 'Gub\'s Grace',
      bonusType: 'enhancement',
      active: false,
      duration: 1,
      bonus: {
        dexterity: 6,
      },
    }, {
      name: 'Gub\'s Strength',
      bonusType: 'enhancement',
      active: false,
      duration: 1,
      bonus: {
        strength: 6,
      },
    }, {
      name: 'Gub\'s Reduce Person',
      bonusType: 'size',
      active: false,
      duration: 1,
      bonus: {
        strength: -2,
        dexterity: 4,
        size: 1,
      },
    }, {
      name: 'Gub\'s Tiny MPII',
      bonusType: 'size',
      active: false,
      duration: 1,
      bonus: {
        strength: -2,
        dexterity: 6,
        size: 1,
        ac: 1,
      },
    }, {
      name: 'Gub\'s Large MPII',
      bonusType: 'size',
      active: false,
      duration: 1,
      bonus: {
        strength: 6,
        dexterity: -2,
        size: -2,
        ac: 4,
      },
    },
  ],

});
</script>

<style scoped>

</style>
