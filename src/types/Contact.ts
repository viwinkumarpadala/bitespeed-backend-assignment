export interface Contact {
  id: number;
  phoneNumber?: string;
  email?: string;
  linkedId?: number;
  linkPrecedence: "secondary" | "primary";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
