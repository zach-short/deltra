import { RelativePathString } from "expo-router";
import { MenuCard } from "@/components/shared/menu/menu-card";

export interface MenuItem {
  title?: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  showDiv?: boolean;
}

interface MenuItemsListProps {
  items: MenuItem[];
}

export function MenuItemsList({ items }: MenuItemsListProps) {
  return (
    <>
      {items.map((item, index) => (
        <MenuCard
          key={index}
          title={item.title}
          name={item.name}
          icon={item.icon}
          href={item.href as RelativePathString}
        />
      ))}
    </>
  );
}
