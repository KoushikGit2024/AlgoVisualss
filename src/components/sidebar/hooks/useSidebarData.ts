import { useState, useEffect, useMemo } from "react";
import ALGODATA from "../../../Pages/algorithms/data/AlgoData";
import PLATFORMDATA from "../../../Pages/visualizer/data/PlatformData";
import { CategoryIcon } from "../../icons";
import type { NavItem } from "../types";
import React from "react";

export function useSidebarData(
  isSidebarPage: boolean,
  isAlgo: boolean,
  isVis: boolean,
  normalizedTopic?: string,
  normalizedPlatform?: string,
  algoTopic?: string,
  platform?: string,
) {
  const [data, setData] = useState<NavItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSidebarPage) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    if (isVis) {
      const targetPlatforms =
        normalizedPlatform && normalizedPlatform !== "visualizer"
          ? PLATFORMDATA.filter((p) => p.name.toLowerCase() === normalizedPlatform)
          : PLATFORMDATA;

      const dataToMapVis = targetPlatforms.length > 0 ? targetPlatforms : PLATFORMDATA;

      const visNavItems: NavItem[] = dataToMapVis.map((p: any) => ({
        id: p.name.toLowerCase().replace(/\s+/g, "-"),
        label: p.name,
        url: p.href,
        icon: p.icon,
        hoverIcon: p.hoverIcon,
        children: p.items?.map((sub: any) => ({
          id: sub.name.toLowerCase().replace(/\s+/g, "-"),
          label: sub.name,
          url: sub.href,
          badge: sub.type,
        })),
      }));

      if (isMounted) {
        setData(visNavItems);
        setLoading(false);
      }
      return;
    }

    if (isAlgo) {
      const targetAlgos =
        normalizedTopic && normalizedTopic !== "algorithms"
          ? ALGODATA.filter((algo) => algo.name.toLowerCase() === normalizedTopic)
          : ALGODATA;

      const dataToMap = targetAlgos.length > 0 ? targetAlgos : ALGODATA;

      const algoNavItems: NavItem[] = dataToMap.map((algo) => {
        return {
          id: algo.name.toLowerCase().replace(/\s+/g, "-"),
          label: algo.name,
          url: algo.href,
          icon: React.createElement(CategoryIcon, { name: algo.iconId }),
          hoverIcon: React.createElement(CategoryIcon, { name: algo.hoverIconId || algo.iconId, hover: true }),
          children: algo.items?.map((sub: any) => ({
            id: sub.name.toLowerCase().replace(/\s+/g, "-"),
            label: sub.name,
            url: sub.href,
            badge: sub.type,
          })),
        };
      });

      if (isMounted) {
        setData(algoNavItems);
        setLoading(false);
      }
      return;
    }

    if (isMounted) setLoading(false);

    return () => {
      isMounted = false;
    };
  }, [algoTopic, isSidebarPage, isAlgo, isVis, platform, normalizedTopic, normalizedPlatform]);

  const quickLinks = useMemo(() => {
    if (isAlgo && normalizedTopic && normalizedTopic !== "algorithms") {
      return ALGODATA.filter((a) => a.name.toLowerCase() !== normalizedTopic).map((a) => {
        return {
          name: a.name,
          href: a.href,
          icon: React.createElement(CategoryIcon, { name: a.iconId }),
          hoverIcon: React.createElement(CategoryIcon, { name: a.hoverIconId || a.iconId, hover: true }),
          featured: (a as any).featured,
        };
      });
    }
    if (isVis && normalizedPlatform && normalizedPlatform !== "visualizer") {
      return PLATFORMDATA.filter((p: any) => p.name.toLowerCase() !== normalizedPlatform).map(
        (p: any) => ({
          name: p.name,
          href: p.href,
          icon: p.icon,
          hoverIcon: p.hoverIcon,
          featured: p.featured,
        }),
      );
    }
    return [];
  }, [isAlgo, isVis, normalizedTopic, normalizedPlatform]);

  return { data, loading, error, quickLinks };
}
