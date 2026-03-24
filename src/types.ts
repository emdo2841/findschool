export interface InitiateData {
  email: string;
  password: string;
}

export interface CompleteRegistrationData {
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
  lga: string;
  role: string;     
  street: string;
}

export interface ReviewAuthor {
  first_name: string;
  last_name: string;
  image?: string;
}

export interface Review {
  _id: string;
  user: ReviewAuthor;
  comments: string;
  rating: number;
  createdAt: string;
}

export interface School {
  _id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  street: string;
  schoolType: "basic" | "basic_secondary" | "secondary";
  school_method: "day" | "boarding" | "day_and_boarding";
  image: string[];
  user: { first_name: string; last_name: string; email: string, _id: string, image?: string };
  review: Review[];
}