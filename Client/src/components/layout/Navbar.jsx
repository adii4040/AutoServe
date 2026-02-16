import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, LogIn, LogOut, Car } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../Services/auth/User.services";

export default function Navbar() {

  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      navigate("/login");
    }
  });

  const navItems = [
    { title: "Home", href: "/home" },
    { title: "Services", href: "#" },
    { title: "Offers", href: "#" },
    { title: "Contact", href: "#" },
    ...(isLoggedIn ? [{ title: "Profile", href: "/user-dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg p-2">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">AutoServe</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link 
              key={item.title} 
              to={item.href} 
              className={`text-sm hover:text-blue-600 ${
                location.pathname === item.href ? "text-blue-600 font-semibold" : ""
              }`}
            >
              {item.title}
            </Link>
          ))}

          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <Button variant="ghost">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-3 mt-8">

                {navItems.map(item => (
                  <Link key={item.title} to={item.href}>
                    <SheetClose>
                      <p className="py-2 border-b">{item.title}</p>
                    </SheetClose>
                  </Link>
                ))}

                {!isLoggedIn ? (
                  <>
                    <Link to="/login">
                      <SheetClose>
                        <Button variant="outline" className="w-full">Login</Button>
                      </SheetClose>
                    </Link>

                    <Link to="/signup">
                      <SheetClose>
                        <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                          Sign Up
                        </Button>
                      </SheetClose>
                    </Link>
                  </>
                ) : (
                  <SheetClose>
                    <Button variant="destructive" className="w-full" onClick={() => logoutMutation.mutate()}>
                      Logout
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
