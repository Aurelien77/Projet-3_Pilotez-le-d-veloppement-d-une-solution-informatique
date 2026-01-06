// ProfilerWrapper.tsx
import React, { Profiler, ReactNode } from "react";

interface ProfilerWrapperProps {
  id: string;
  children: ReactNode;
  onRender?: (metrics: ProfilerMetrics) => void; // 👈 Ajouter cette prop
}

// 👇 Exporter ce type
export interface ProfilerMetrics {
  id: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

const ProfilerWrapper: React.FC<ProfilerWrapperProps> = ({
  id,
  children,
  onRender, // 👈 Accepter le callback
}) => {
  const onRenderCallback: React.ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    const metrics: ProfilerMetrics = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    };

    const icon = {
      mount: "🆕",
      update: "🔄",
      "nested-update": "⚠️",
    }[phase];

    const color = actualDuration > 100 ? "🔴" : actualDuration > 50 ? "🟡" : "🟢";

    console.log(`${color} ${icon} [Profiler] ${id}`, `| phase: ${phase}`, `| duration: ${actualDuration.toFixed(2)}ms`);

    if (actualDuration > 100) {
      console.warn(`⚠️ ATTENTION: ${id} est lent (${actualDuration.toFixed(2)}ms)`);
    }

    if (phase === "nested-update") {
      console.warn(`⚠️ NESTED UPDATE détecté dans ${id}`);
    }

    // 👇 Appeler le callback personnalisé
    onRender?.(metrics);
  };

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

export default ProfilerWrapper;
