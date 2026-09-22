import { useGameStore } from "../../game/state/store";
import { ProgressBar } from "../components/ProgressBar";
import { xpRequiredForLevel } from "../../game/systems/skills";
import type { Character, Needs, SkillLevels } from "../../game/state/types";

const NEEDS_LABELS: Record<keyof Needs, string> = {
  hunger: "Hunger",
  thirst: "Thirst",
  energy: "Energy",
};

const SKILL_LABELS: Record<keyof SkillLevels, string> = {
  gathering: "Gathering",
  crafting: "Crafting",
  hunting: "Hunting",
  fighting: "Fighting",
};

function needsColor(value: number): string {
  if (value < 25) return "bg-danger";
  if (value < 50) return "bg-accent";
  return "bg-ok";
}

function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-text">{character.name}</div>
          <div className="text-xs text-text-dim capitalize">
            {character.status}
          </div>
        </div>
        <div className="text-sm text-text-dim">
          HP {Math.floor(character.hp)}/{character.hpMax}
        </div>
      </div>

      <ProgressBar
        value={character.hp}
        max={character.hpMax}
        colorClass={
          character.hp < character.hpMax * 0.3 ? "bg-danger" : "bg-ok"
        }
      />

      <div className="flex flex-col gap-2">
        {(Object.keys(NEEDS_LABELS) as (keyof Needs)[]).map((key) => (
          <ProgressBar
            key={key}
            value={character.needs[key]}
            max={100}
            colorClass={needsColor(character.needs[key])}
            label={NEEDS_LABELS[key]}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-panel-border">
        {(Object.keys(SKILL_LABELS) as (keyof SkillLevels)[]).map((skill) => {
          const level = character.skills[skill];
          const xp = character.xp[skill];
          const nextThreshold = xpRequiredForLevel(level);
          return (
            <div key={skill}>
              <div className="flex justify-between text-xs text-text-dim mb-1">
                <span>
                  {SKILL_LABELS[skill]} — Lv {level}
                </span>
                <span>
                  {Math.floor(xp)}/{nextThreshold} xp
                </span>
              </div>
              <ProgressBar
                value={xp}
                max={nextThreshold}
                colorClass="bg-accent"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CharacterPanel() {
  const characters = useGameStore((s) => s.state.characters);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  );
}
