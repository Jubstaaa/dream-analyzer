export interface UserEntity {
  id: string;
  email: string;
  name: string;
  surname: string;
  imageUrl: string | null;
  gender?: string | null;
  birthday?: string | null;
  premiumExpireDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export class User implements UserEntity {
  id: string;
  email: string;
  name: string;
  surname: string;
  imageUrl: string | null;
  gender?: string | null;
  birthday?: string | null;
  premiumExpireDate: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.surname = data.surname;
    this.imageUrl = data.imageUrl;
    this.gender = data.gender;
    this.birthday = data.birthday;
    this.premiumExpireDate = data.premiumExpireDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  get fullname(): string {
    return `${this.name} ${this.surname}`;
  }

  get isPremium(): boolean {
    if (!this.premiumExpireDate) return false;
    return new Date(this.premiumExpireDate) > new Date();
  }
}
