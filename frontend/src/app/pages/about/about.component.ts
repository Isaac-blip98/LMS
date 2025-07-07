import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen bg-white text-gray-900 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-20 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style="animation-delay: 2s"></div>
        <div class="absolute top-1/2 left-1/3 w-32 h-32 bg-indigo-200 rounded-full opacity-30 blur-2xl animate-bounce" style="animation-delay: 1s"></div>
      </div>

      <!-- Content Container -->
      <div class="relative z-10 flex min-h-screen">
        <!-- Left Side - Text Content -->
        <div class="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div class="max-w-2xl">
            <!-- Brand Logo Area -->
            <div class="mb-8 flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-300 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <span class="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">LearningHub</span>
            </div>

            <!-- Main Heading -->
            <h1 class="text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span class="block">About</span>
              <span class="block bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Us</span>
            </h1>

            <!-- Tagline -->
            <div class="mb-12">
              <p class="text-xl lg:text-2xl text-gray-700 font-light leading-relaxed">
                Your Digital Learning Partner. We transform visions into educational realities. We're more than just a learning platform.
              </p>
            </div>

            <!-- Content -->
            <div class="space-y-6">
              <p class="text-lg text-gray-700 leading-relaxed">
                Welcome to LearningHub! We are dedicated to providing world-class online education, connecting learners with top instructors and innovative content. Our mission is to empower your future through accessible, high-quality learning experiences.
              </p>
              <p class="text-gray-500 leading-relaxed">
                Whether you are looking to advance your career, learn a new skill, or explore a passion, LearningHub is here to support your journey every step of the way.
              </p>
            </div>

            <!-- CTA Button -->
            <div class="mt-12">
              <button (click)="goToMyCourses()" class="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full font-semibold text-white shadow-2xl hover:shadow-blue-400/25 transition-all duration-300 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500">
                <span class="relative z-10">Start Learning</span>
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side - Visual Element -->
        <div class="hidden lg:flex flex-1 items-center justify-center px-8">
          <div class="relative">
            <!-- Laptop Mockup -->
            <div class="relative transform rotate-12 hover:rotate-6 transition-transform duration-700">
              <div class="w-96 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl border border-gray-200">
                <!-- Screen -->
                <div class="p-3">
                  <div class="w-full h-52 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 rounded-xl relative overflow-hidden">
                    <!-- Mock Content -->
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-purple-200/20"></div>
                    <div class="relative z-10 p-6">
                      <div class="text-gray-900 text-sm font-bold mb-2">LearningHub</div>
                      <div class="text-2xl font-bold text-gray-900 mb-4">
                        More than<br>just a learning<br>platform
                      </div>
                      <div class="w-16 h-6 bg-orange-300 rounded opacity-80"></div>
                    </div>
                    <!-- Floating Elements -->
                    <div class="absolute top-4 right-4 w-8 h-8 bg-blue-200 rounded-full opacity-60 animate-bounce"></div>
                    <div class="absolute bottom-8 left-8 w-6 h-6 bg-purple-200 rounded-full opacity-60 animate-pulse"></div>
                    <div class="absolute bottom-4 right-8 w-4 h-4 bg-pink-200 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s"></div>
                  </div>
                </div>
              </div>
              <!-- Keyboard -->
              <div class="w-full h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-b-xl shadow-lg"></div>
            </div>
            <!-- Floating Cards -->
            <div class="absolute -top-8 -left-8 w-24 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl shadow-xl opacity-80 animate-float"></div>
            <div class="absolute -bottom-8 -right-8 w-20 h-28 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl shadow-xl opacity-80 animate-float" style="animation-delay: 1s"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Stats/Features -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/60 to-transparent p-8">
        <div class="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <div class="flex space-x-8">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span>Online Learning</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <span>Expert Instructors</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
              <span>Innovative Content</span>
            </div>
          </div>
          <div class="hidden md:block text-xs text-gray-400">
            Empowering your future through accessible education
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f3f4f6;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #93c5fd, #c4b5fd);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, #60a5fa, #a78bfa);
    }
  `]
})
export class AboutComponent {
  constructor(private router: Router) {}

  goToMyCourses() {
    this.router.navigate(['/student/courses']);
  }
}