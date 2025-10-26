"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

interface SkinInfo {
  Name: string;
  Desc: string;
  Image: string;
}

interface Character {
  code: string;
  rank: number;
  type: number;
  element: number;
  hit: number;
  camp: number;
  icon: string;
  potential?: number[];
  EN: string;
  KO: string;
  CHS?: string;
  JA?: string;
  desc?: string;
  skin?: Record<string, SkinInfo>;
}

interface Weapon {
  icon: string;
  rank: number;
  type: number;
  EN: string;
  KO: string;
  CHS?: string;
  JA?: string;
  desc?: string;
}

interface Bangboo {
  icon: string;
  rank: number;
  codename: string;
  EN: string;
  KO: string;
  CHS?: string;
  JA?: string;
  desc?: string;
}

type CharactersData = Record<string, Character>;
type WeaponsData = Record<string, Weapon>;
type BangboosData = Record<string, Bangboo>;

type TabType = "characters" | "weapons" | "bangboos";

const typeNames: Record<number, string> = {
  1: "공격",
  2: "격파",
  3: "이상",
  4: "지원",
  5: "방어",
  6: "특수",
};

const elementNames: Record<number, string> = {
  200: "물리",
  201: "불",
  202: "얼음",
  203: "전기",
  205: "에테르",
};

const elementColors: Record<number, string> = {
  200: "bg-orange-400", // 물리
  201: "bg-red-600", // 불
  202: "bg-cyan-300", // 얼음
  203: "bg-blue-400", // 전기
  205: "bg-purple-400", // 에테르
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("characters");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRank, setFilterRank] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [characters, setCharacters] = useState<CharactersData>({});
  const [weapons, setWeapons] = useState<WeaponsData>({});
  const [bangboos, setBangboos] = useState<BangboosData>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [charsRes, weaponsRes, bangboosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/zzz/characters`),
        fetch(`${API_BASE_URL}/api/zzz/weapons`),
        fetch(`${API_BASE_URL}/api/zzz/bangboos`),
      ]);

      if (!charsRes.ok || !weaponsRes.ok || !bangboosRes.ok) {
        throw new Error("데이터를 불러오는데 실패했습니다");
      }

      const charsData: CharactersData = await charsRes.json();
      const weaponsData: WeaponsData = await weaponsRes.json();
      const bangboosData: BangboosData = await bangboosRes.json();

      setCharacters(charsData);
      setWeapons(weaponsData);
      setBangboos(bangboosData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number): string => {
    return rank === 4 ? "text-yellow-400" : "text-purple-400";
  };

  const getRankStars = (rank: number): string => {
    return "★".repeat(rank + 1);
  };

  const filterItems = <T extends { KO?: string; EN?: string; rank: number }>(
    items: Record<string, T>
  ): [string, T][] => {
    return Object.entries(items).filter(([id, item]) => {
      const matchesSearch =
        item.KO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.EN?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRank =
        filterRank === "all" || item.rank === parseInt(filterRank);
      return matchesSearch && matchesRank;
    });
  };

  const renderCharacters = () => {
    const filtered = filterItems(characters);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(([id, char]) => (
          <div
            key={id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{char.KO}</h3>
                <p className="text-gray-400 text-sm">{char.EN}</p>
              </div>
              <span className={`text-2xl ${getRankColor(char.rank)}`}>
                {getRankStars(char.rank)}
              </span>
            </div>

            <div className="flex gap-2 mb-2">
              <span className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                {typeNames[char.type] || "알 수 없음"}
              </span>
              <span
                className={`px-2 py-1 rounded text-sm text-white ${
                  elementColors[char.element] || "bg-gray-600"
                }`}
              >
                {elementNames[char.element] || "알 수 없음"}
              </span>
            </div>

            {char.desc && (
              <p className="text-gray-400 text-xs line-clamp-3 mt-2">
                {char.desc}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWeapons = () => {
    const filtered = filterItems(weapons);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(([id, weapon]) => (
          <div
            key={id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{weapon.KO}</h3>
                <p className="text-gray-400 text-sm">{weapon.EN}</p>
              </div>
              <span className={`text-xl ${getRankColor(weapon.rank)}`}>
                {getRankStars(weapon.rank)}
              </span>
            </div>

            <div className="flex gap-2 mb-2">
              <span className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                {typeNames[weapon.type] || "알 수 없음"}
              </span>
            </div>

            {weapon.desc && (
              <p className="text-gray-400 text-xs line-clamp-2 mt-2">
                {weapon.desc}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBangboos = () => {
    const filtered = filterItems(bangboos);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(([id, bangboo]) => (
          <div
            key={id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{bangboo.KO}</h3>
                <p className="text-gray-400 text-sm">{bangboo.EN}</p>
              </div>
              <span className={`text-xl ${getRankColor(bangboo.rank)}`}>
                {getRankStars(bangboo.rank)}
              </span>
            </div>

            {bangboo.desc && (
              <p className="text-gray-400 text-xs line-clamp-2 mt-2">
                {bangboo.desc}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getCurrentDataLength = (): number => {
    switch (activeTab) {
      case "characters":
        return Object.keys(characters).length;
      case "weapons":
        return Object.keys(weapons).length;
      case "bangboos":
        return Object.keys(bangboos).length;
      default:
        return 0;
    }
  };

  const getFilteredLength = (): number => {
    switch (activeTab) {
      case "characters":
        return filterItems(characters).length;
      case "weapons":
        return filterItems(weapons).length;
      case "bangboos":
        return filterItems(bangboos).length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* 탭 메뉴 */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("characters")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "characters"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            캐릭터 ({Object.keys(characters).length})
          </button>
          <button
            onClick={() => setActiveTab("weapons")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "weapons"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            무기 ({Object.keys(weapons).length})
          </button>
          <button
            onClick={() => setActiveTab("bangboos")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "bangboos"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            방부 ({Object.keys(bangboos).length})
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">모든 등급</option>
            <option value="4">★★★★★</option>
            <option value="3">★★★★</option>
          </select>
        </div>

        {/* 결과 표시 */}
        <div className="mb-4 text-gray-400">
          총 {getFilteredLength()}개 항목
        </div>

        {/* 컨텐츠 */}
        {activeTab === "characters" && renderCharacters()}
        {activeTab === "weapons" && renderWeapons()}
        {activeTab === "bangboos" && renderBangboos()}
      </div>
    </div>
  );
}

export default App;
