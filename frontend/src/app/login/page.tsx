"use client";

import { useState, useEffect } from "react";
import { LoginData } from "../../types/index.js";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--gradient-background)" }}
    >
      <div className="container mx-auto px-4 py-8 text-primary-50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Työharjoittelu Seuranta
            </h1>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Seuraa päivittäisiä aktiviteettejasi, oppimistasi ja edistymistäsi
            työharjoittelun aikana
          </p>
        </div>

        <div className="flex flex-col items-center  ">
          <form action="" className="glass-card m-6 rounded-2xl p-12">
            <h3>Kirjaudu sisään</h3>

            <div className="p-6 space-y-6">
              {/* Activities */}
              <div className="">
                <label htmlFor="email">Sähköposti</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="input-field resize-none h-12"
                  placeholder="Sähköposti"
                />
              </div>

              {/* Learnings */}
              <div className="">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="input-field resize-none h-12"
                  placeholder="Salasana"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Kirjaudu sisään
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
