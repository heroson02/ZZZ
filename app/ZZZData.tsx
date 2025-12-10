"use client";

import React, { useState, useEffect, JSX } from "react";
import { Search, Loader, Filter, X, Star } from "lucide-react";

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
  200: "from-orange-500 to-amber-600",
  201: "from-red-500 to-rose-600",
  202: "from-cyan-400 to-blue-500",
  203: "from-blue-400 to-indigo-600",
  205: "from-purple-500 to-violet-600",
};

const rankGradients: Record<number, string> = {
  4: "from-yellow-500/20 to-amber-500/20",
  3: "from-purple-500/20 to-violet-500/20",
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("characters");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRank, setFilterRank] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

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

  const getRankStars = (rank: number): JSX.Element[] => {
    return Array(rank + 1)
      .fill(0)
      .map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />);
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

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</div>
          <div className="text-gray-600 text-sm">
            다른 검색어를 시도해보세요
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(([id, char]) => (
          <div
            key={id}
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                rankGradients[char.rank]
              } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>

            <div className="relative p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {char.KO}
                  </h3>
                  <p className="text-gray-400 text-sm">{char.EN}</p>
                </div>
                <div className={`flex gap-0.5 ${getRankColor(char.rank)}`}>
                  {getRankStars(char.rank)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1.5 bg-gray-700/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-200 border border-gray-600/50">
                  {typeNames[char.type] || "알 수 없음"}
                </span>
                <span
                  className={`px-3 py-1.5 bg-gradient-to-r ${
                    elementColors[char.element] || "from-gray-500 to-gray-600"
                  } rounded-full text-xs font-medium text-white shadow-lg`}
                >
                  {elementNames[char.element] || "알 수 없음"}
                </span>
              </div>

              {char.desc && (
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                  {char.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeapons = () => {
    const filtered = filterItems(weapons);

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</div>
          <div className="text-gray-600 text-sm">
            다른 검색어를 시도해보세요
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(([id, weapon]) => (
          <div
            key={id}
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                rankGradients[weapon.rank]
              } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>

            <div className="relative p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                    {weapon.KO}
                  </h3>
                  <p className="text-gray-400 text-sm">{weapon.EN}</p>
                </div>
                <div className={`flex gap-0.5 ${getRankColor(weapon.rank)}`}>
                  {getRankStars(weapon.rank)}
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1.5 bg-gray-700/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-200 border border-gray-600/50">
                  {typeNames[weapon.type] || "알 수 없음"}
                </span>
              </div>

              {weapon.desc && (
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {weapon.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBangboos = () => {
    const filtered = filterItems(bangboos);

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</div>
          <div className="text-gray-600 text-sm">
            다른 검색어를 시도해보세요
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {filtered.map(([id, bangboo]) => (
          <div
            key={id}
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                rankGradients[bangboo.rank]
              } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>

            <div className="relative p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                    {bangboo.KO}
                  </h3>
                  <p className="text-gray-400 text-xs">{bangboo.EN}</p>
                </div>
                <div className={`flex gap-0.5 ${getRankColor(bangboo.rank)}`}>
                  {getRankStars(bangboo.rank)}
                </div>
              </div>

              {bangboo.desc && (
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {bangboo.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-white text-xl font-semibold">데이터 로딩 중...</p>
          <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-400 text-xl mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Zenless Zone Zero
              </h1>
              <p className="text-gray-400 text-sm mt-1">데이터베이스</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("characters")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "characters"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              캐릭터{" "}
              <span className="text-sm opacity-70">
                ({Object.keys(characters).length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("weapons")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "weapons"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              무기{" "}
              <span className="text-sm opacity-70">
                ({Object.keys(weapons).length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("bangboos")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "bangboos"
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              방부{" "}
              <span className="text-sm opacity-70">
                ({Object.keys(bangboos).length})
              </span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all"
              />
            </div>

            <select
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="px-5 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all cursor-pointer"
            >
              <option value="all">모든 등급</option>
              <option value="4">★★★★★</option>
              <option value="3">★★★★</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            총{" "}
            <span className="text-white font-semibold">
              {getFilteredLength()}
            </span>
            개 항목
          </div>
        </div>

        {/* Content Grid */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "characters" && renderCharacters()}
          {activeTab === "weapons" && renderWeapons()}
          {activeTab === "bangboos" && renderBangboos()}
        </div>
      </div>
    </div>
  );
}

export default App;
