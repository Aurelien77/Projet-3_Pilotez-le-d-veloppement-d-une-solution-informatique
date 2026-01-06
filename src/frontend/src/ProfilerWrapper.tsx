import React, { Profiler, ReactNode } from "react";

interface ProfilerWrapperProps {
  id: string;
  children: ReactNode;
}

const ProfilerWrapper: React.FC<ProfilerWrapperProps> = ({ id, children }) => {
  const onRenderCallback: React.ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    const icon = {
      mount: "🆕",
      update: "🔄",
      "nested-update": "⚠️",
    }[phase];

    // Colorer selon la performance
    const color = actualDuration > 100 ? "🔴" : actualDuration > 50 ? "🟡" : "🟢";

    console.log(`${color} ${icon} [Profiler] ${id}`, `| phase: ${phase}`, `| duration: ${actualDuration.toFixed(2)}ms`, `| base: ${baseDuration.toFixed(2)}ms`);

    // Avertissement si lent
    if (actualDuration > 100) {
      console.warn(`⚠️ ATTENTION: ${id} est lent (${actualDuration.toFixed(2)}ms)`);
    }

    // Avertissement si nested-update
    if (phase === "nested-update") {
      console.warn(`⚠️ NESTED UPDATE détecté dans ${id} - vérifier les side effects`);
    }
  };

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

export default ProfilerWrapper;
