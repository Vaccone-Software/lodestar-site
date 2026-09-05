"use client";

import {
  SceneApp,
  SceneButton,
  SceneClipboard,
  SceneCoach,
  ScenePage,
  SceneSpeech,
  SceneText,
} from "@/components/Scenes";
import {
  Keys,
  SceneBreath,
  SceneChooser,
  SceneChord,
  SceneCommands,
  SceneEdit,
  SceneLauncher,
  SceneMeeting,
  ScenePromote,
  SceneScroll,
  SceneUndo,
} from "@/components/GuideScenes";

// Resolves a lesson's scene name to the scene, so the guide's data stays
// plain. A lesson with no scene shows its keys lit and its rule.
const scenes: Record<string, () => React.ReactElement> = {
  app: SceneApp,
  launcher: SceneLauncher,
  chooser: SceneChooser,
  chord: SceneChord,
  breath: SceneBreath,
  undo: SceneUndo,
  page: ScenePage,
  promote: ScenePromote,
  button: SceneButton,
  commands: SceneCommands,
  scroll: SceneScroll,
  text: SceneText,
  clipboard: SceneClipboard,
  speech: SceneSpeech,
  edit: SceneEdit,
  coach: SceneCoach,
  meeting: SceneMeeting,
};

export default function GuideScene({
  scene,
  lit,
  caption,
}: {
  scene?: string;
  lit: string[];
  caption: string;
}) {
  const Scene = scene ? scenes[scene] : undefined;
  if (Scene) return <Scene />;
  return <Keys lit={lit} caption={caption} />;
}
