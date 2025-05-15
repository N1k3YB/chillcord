"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { SearchModal } from "@/components/modals/SearchModal";

interface SearchModalContextType {
  isOpen: boolean;
  openModal: (initialTab?: 'channels' | 'users') => void;
  closeModal: () => void;
}

const SearchModalContext = createContext<SearchModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export const useSearchModal = () => useContext(SearchModalContext);

export const SearchModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'channels' | 'users'>('channels');

  const openModal = (tab: 'channels' | 'users' = 'channels') => {
    setInitialTab(tab);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Обработчик события открытия модального окна
  useEffect(() => {
    const handleOpenSearchModal = (event: CustomEvent<{ initialTab?: 'channels' | 'users' }>) => {
      const tab = event.detail?.initialTab || 'channels';
      openModal(tab);
    };

    window.addEventListener("open-search-modal" as any, handleOpenSearchModal);

    return () => {
      window.removeEventListener("open-search-modal" as any, handleOpenSearchModal);
    };
  }, []);

  return (
    <SearchModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <SearchModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        initialTab={initialTab} 
      />
    </SearchModalContext.Provider>
  );
}; 