export interface MenuItemData{
    id: string;
    name: string;
    link?: string;
    children?: MenuItemData[];
}