import * as Misskey from "iceshrimp-sdk";
import { Ref } from "vue";

export type MenuAction = (ev: MouseEvent) => void;

export type MenuDivider = null;
export type MenuNull = undefined;
export type MenuLabel = {
	type: "label";
	text: string;
	textStyle?: string;
};
export type MenuLink = {
	type: "link";
	to: string;
	text: string;
	textStyle?: string;
	icon?: string;
	indicate?: boolean;
	avatar?: Misskey.entities.User;
};
export type MenuA = {
	type: "a";
	href: string;
	target?: string;
	download?: string;
	text: string;
	textStyle?: string;
	icon?: string;
	indicate?: boolean;
};
export type MenuUser = {
	type: "user";
	user: Misskey.entities.User;
	active?: boolean;
	indicate?: boolean;
	hidden?: boolean;
	action: MenuAction;
};
export type MenuSwitch = {
	type: "switch";
	ref: Ref<boolean>;
	text: string;
	textStyle?: string;
	disabled?: boolean;
};
export type MenuButton = {
	type?: "button";
	text: string;
	textStyle?: string;
	icon?: string;
	indicate?: boolean;
	danger?: boolean;
	accent?: boolean;
	active?: boolean;
	hidden?: boolean;
	avatar?: Misskey.entities.User;
	action: MenuAction;
};
export type MenuParent = {
	type: "parent";
	text: string;
	textStyle?: string;
	icon?: string;
	children: OuterMenuItem[];
};

export type MenuPending = { type: "pending" };

type OuterMenuItem =
	| MenuDivider
	| MenuNull
	| MenuLabel
	| MenuLink
	| MenuA
	| MenuUser
	| MenuSwitch
	| MenuButton
	| MenuParent;
type OuterPromiseMenuItem = Promise<
	MenuLabel | MenuLink | MenuA | MenuUser | MenuSwitch | MenuButton | MenuParent
>;
export type MenuItem = OuterMenuItem | OuterPromiseMenuItem;
export type InnerMenuItem =
	| MenuDivider
	| MenuPending
	| MenuLabel
	| MenuLink
	| MenuA
	| MenuUser
	| MenuSwitch
	| MenuButton
	| MenuParent;
