"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import API from "@/lib/api1";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";


type Kitchen = {
  id:number;
  name:string;
  code:string;
  location:string;
};

export default function KitchenPage(){
  const router = useRouter();
  const [kitchens,setKitchens] =useState<Kitchen[]>([]);
  const [loading,setLoading] =useState(true);

  useEffect(()=>{
    const fetchKitchen = async()=>{
      try{
        const res = await API.get(
          "/kitchens/"
        );
        setKitchens(
          res.data
        );
      }catch(err){
        console.log(err);
      }
      finally{
        setLoading(false);
      }
    };
    fetchKitchen();
  },[]);

  if(loading){
    return(
      <div>
        Loading kitchens...
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Kitchen Management
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
      {
        kitchens.map((kitchen)=>(
          <Card
            key={kitchen.id}
            className="cursor-pointer hover:shadow-lg"
            onClick={()=>
              router.push(
                `/management/kitchen/${kitchen.id}/qr`
              )

            }
          >
            <CardHeader>
              <CardTitle>{kitchen.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Code:
                {" "}
                {kitchen.code}
              </p>
              <p>
                Location:
                {" "}
                {kitchen.location}
              </p>
              <Button className="mt-4 w-full">
                View QR
              </Button>
            </CardContent>
          </Card>
        ))
      }
      </div>
    </div>
  );
}