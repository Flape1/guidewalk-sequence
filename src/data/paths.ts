
// Path data containing sequences of images
export interface PathStep {
  id: number;
  image: string;
  description: string;
}

export interface Path {
  id: string;
  name: string;
  description: string;
  steps: PathStep[];
}

const paths: Path[] = [
  {
    id: "basement-entrance",
    name: "Basement Entrance",
    description: "Path to PHI MEDCARE through the basement entrance",
    steps: [
      {
        id: 1,
        image: "/lovable-uploads/5be784a1-3c8b-4630-94f3-05373aff5a60.png",
        description: "Start at the entrance of PHI MEDCARE building"
      },
      {
        id: 2,
        image: "/lovable-uploads/cf658855-683b-4035-a933-4f626f395bd4.png",
        description: "Enter the basement parking entrance ramp"
      },
      {
        id: 3,
        image: "/lovable-uploads/a35d8e4d-23b2-4af0-badc-402ab593c9f7.png",
        description: "Follow the path through the parking area"
      },
      {
        id: 4,
        image: "/lovable-uploads/4322a7d4-8c4d-452a-bae2-035f7b3bbe91.png",
        description: "Continue straight ahead through the parking lot"
      },
      {
        id: 5,
        image: "/lovable-uploads/86961f73-9688-4fea-a4ca-b805f5bd5fc3.png",
        description: "Proceed to the entrance doors at the end"
      },
      {
        id: 6,
        image: "/lovable-uploads/d58936fd-6f00-431a-abf0-6e497713f98f.png",
        description: "Take the elevator at level B1 to your desired floor"
      }
    ]
  }
];

export default paths;
