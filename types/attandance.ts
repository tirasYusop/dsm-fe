export interface Attendance {
  id:number;
  student:{
    student_id:string;
    name:string;
    faculty:string;
  };
  booking?:{
    id:number;
    slot:{
      date:string;
      start_time:string;
      end_time:string;
    };
    number_of_people:number;
  };

  kitchen:{
    id:number;
    name:string;
    code:string;
    }
  attendance_type:string;
  check_in_time:string;
};

export interface Participant {
  id:number;
  name:string;
  student_id:string;
  faculty:string;
  is_owner:boolean;
};

export interface Kitchen {
  id: number;
  name: string;
  code: string;
};


export interface FoodbankTakenItem {
  id: number;
  item: number;
  item_name: string;
  quantity: number;
};

export interface StudentActivity {
  id: number;
  attendance: number;
  took_rice: boolean;
  took_dish: boolean;
  took_foodbank: boolean;
  used_kitchen: boolean;
  foodbank_items: FoodbankTakenItem[];
};
