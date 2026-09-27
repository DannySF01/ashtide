import { useState } from "react";
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

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function CharacterListItem({
  character,
  selected,
  onSelect,
}: {
  character: Character;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-left transition-colors ${
        selected
          ? "bg-accent/20 border border-accent"
          : "hover:bg-panel-border border border-transparent"
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-panel-border flex items-center justify-center text-xs font-semibold text-text shrink-0">
        {initials(character.name)}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-text font-medium truncate">
          {character.name}
        </div>
        <div className="text-xs text-text-dim capitalize">
          {character.status}
        </div>
      </div>
    </button>
  );
}

function CharacterDetail({ character }: { character: Character }) {
  return (
    <div className="bg-panel/90 backdrop-blur-sm border border-panel-border rounded-lg p-4 flex flex-col gap-4 w-72">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-panel-border flex items-center justify-center text-xl font-semibold text-text shrink-0">
          {initials(character.name)}
        </div>
        <div>
          <div className="text-base font-semibold text-text">
            {character.name}
          </div>
          <div className="text-xs text-text-dim">
            HP {Math.floor(character.hp)}/{character.hpMax}
          </div>
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

      <div className="flex flex-col gap-2 pt-3 border-t border-panel-border">
        <div className="text-xs text-text-dim uppercase tracking-wide">
          Skills
        </div>
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = characters.find((c) => c.id === selectedId) ?? characters[0];

  if (!selected) return null;

  return (
    <div className="flex gap-3">
      <div className="bg-panel/90 backdrop-blur-sm border border-panel-border rounded-lg p-2 flex flex-col gap-1 w-44 shrink-0">
        {characters.map((character) => (
          <CharacterListItem
            key={character.id}
            character={character}
            selected={character.id === selected.id}
            onSelect={() => setSelectedId(character.id)}
          />
        ))}
      </div>

      <CharacterDetail character={selected} />
    </div>
  );
}
