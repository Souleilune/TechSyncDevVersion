// seedMissingLanguageChallenges.js
// Seeds coding challenges for programming languages that don't have any challenges yet

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL is required in .env file');
    process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required in .env file');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

console.log('✅ Environment variables loaded and Supabase client initialized\n');

// Challenge templates for different programming languages
const challengeTemplates = {
    // Core Programming Languages
    1: { // Java
        title: 'HashMap Custom Implementation',
        description: 'Implement a custom HashMap with basic operations: put, get, remove, and handle collisions using chaining. The HashMap should store String keys and String values, use an array of buckets with linked list chaining for collision resolution, and support dynamic resizing.',
        difficulty_level: 'medium',
        time_limit_minutes: 60,
        test_cases: [
            { 
                input: { 
                    operations: ['put("name", "John")', 'put("age", "25")', 'get("name")'],
                    initialCapacity: 16
                }, 
                expected_output: { get_result: 'John', size: 2 }
            },
            { 
                input: { 
                    operations: ['put("key1", "value1")', 'put("key1", "value2")', 'get("key1")'],
                    initialCapacity: 16
                }, 
                expected_output: { get_result: 'value2', size: 1 }
            },
            { 
                input: { 
                    operations: ['put("a", "1")', 'put("b", "2")', 'remove("a")', 'get("a")'],
                    initialCapacity: 16
                }, 
                expected_output: { get_result: null, size: 1 }
            }
        ],
        starter_code: `import java.util.*;

public class CustomHashMap<K, V> {
    private static class Entry<K, V> {
        K key;
        V value;
        Entry<K, V> next;
        
        Entry(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }
    
    private Entry<K, V>[] buckets;
    private int size;
    
    public void put(K key, V value) {
        // Your code here
    }
    
    public V get(K key) {
        // Your code here
        return null;
    }
}`,
        expected_solution: `public void put(K key, V value) {
    int index = Math.abs(key.hashCode() % buckets.length);
    Entry<K, V> entry = buckets[index];
    
    while (entry != null) {
        if (entry.key.equals(key)) {
            entry.value = value;
            return;
        }
        entry = entry.next;
    }
    
    Entry<K, V> newEntry = new Entry<>(key, value);
    newEntry.next = buckets[index];
    buckets[index] = newEntry;
    size++;
}`
    },
    3: { // Python
        title: 'Decorator Pattern Implementation',
        description: 'Create a decorator that logs function execution time and arguments. The decorator should print the function name, arguments passed, and execution time. Handle both sync and async functions.',
        difficulty_level: 'medium',
        time_limit_minutes: 45,
        test_cases: [
            { 
                input: { function: 'add(2, 3)', args: [2, 3] }, 
                expected_output: { result: 5, logged: true, execution_time_ms: '<100' }
            },
            { 
                input: { function: 'multiply(4, 5)', args: [4, 5] }, 
                expected_output: { result: 20, logged: true, execution_time_ms: '<100' }
            }
        ],
        starter_code: `import time
import functools
from typing import Callable

def execution_logger(func: Callable):
    """
    Decorator that logs function execution time and arguments
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Your code here
        pass
    return wrapper

# Test function
@execution_logger
def sample_function(x, y):
    time.sleep(0.1)
    return x + y`,
        expected_solution: `def execution_logger(func: Callable):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time:.4f} seconds")
        return result
    return wrapper`
    },
    7: { // SQL
        title: 'Complex Database Queries',
        description: 'Write SQL queries to analyze user activity from a social media database. Given tables: users (id, username, email, created_at), posts (id, user_id, content, created_at), and comments (id, post_id, user_id, content, created_at). Tasks: 1) Find top 10 users by total posts, 2) Calculate engagement rate (comments per post) for each user, 3) Identify users who haven\'t posted in the last 30 days.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { 
                input: { query_type: 'top_users', limit: 10 }, 
                expected_output: { columns: ['username', 'post_count'], row_count: 10, ordered_by: 'post_count DESC' }
            },
            { 
                input: { query_type: 'engagement_rate' }, 
                expected_output: { columns: ['username', 'posts', 'comments', 'engagement_rate'], has_calculation: true }
            },
            { 
                input: { query_type: 'inactive_users', days: 30 }, 
                expected_output: { columns: ['username', 'last_post'], condition: 'older_than_30_days' }
            }
        ],
        starter_code: `-- Given tables:
-- users (id, username, email, created_at)
-- posts (id, user_id, content, created_at)
-- comments (id, post_id, user_id, content, created_at)

-- Task 1: Find top 10 users by total posts
-- Your query here

-- Task 2: Calculate engagement rate (comments per post) for each user
-- Your query here

-- Task 3: Find users who haven't posted in the last 30 days
-- Your query here`,
        expected_solution: `-- Task 1: Top 10 users by posts
SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.username
ORDER BY post_count DESC
LIMIT 10;

-- Task 2: Engagement rate
SELECT u.username, 
       COUNT(DISTINCT p.id) as posts,
       COUNT(c.id) as comments,
       CASE WHEN COUNT(DISTINCT p.id) > 0 
            THEN CAST(COUNT(c.id) AS FLOAT) / COUNT(DISTINCT p.id)
            ELSE 0 END as engagement_rate
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY u.id, u.username;

-- Task 3: Inactive users
SELECT u.username, MAX(p.created_at) as last_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.username
HAVING MAX(p.created_at) < NOW() - INTERVAL '30 days' OR MAX(p.created_at) IS NULL;`
    },
    9: { // Kotlin
        title: 'Coroutines and Flow',
        description: 'Implement a data processing pipeline using Kotlin coroutines and Flow. Handle backpressure and errors gracefully.',
        difficulty_level: 'hard',
        time_limit_minutes: 70,
        test_cases: [
            { 
                input: { range: '1-100', filters: 'even numbers, squared, take 10' }, 
                expected_output: { result: [4, 16, 36, 64, 100, 144, 196, 256, 324, 400], count: 10 }
            },
            { 
                input: { range: '1-50', filters: 'odd numbers, doubled' }, 
                expected_output: { result: [2, 6, 10, 14, 18], count: 5 }
            }
        ],
        starter_code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class DataProcessor {
    // Create a flow that emits numbers 1-100
    fun createDataFlow(): Flow<Int> = flow {
        // Your code here
    }
    
    // Process data with transformation
    suspend fun processData(): List<Int> {
        // Your code here
        return emptyList()
    }
}`,
        expected_solution: `fun createDataFlow(): Flow<Int> = flow {
    for (i in 1..100) {
        delay(10) // Simulate data fetching
        emit(i)
    }
}

suspend fun processData(): List<Int> = createDataFlow()
    .filter { it % 2 == 0 }
    .map { it * it }
    .take(10)
    .toList()`
    },
    10: { // Ruby
        title: 'Metaprogramming Magic',
        description: 'Create a dynamic ORM-like class that defines methods dynamically based on database columns.',
        difficulty_level: 'hard',
        time_limit_minutes: 65,
        test_cases: [
            { 
                input: { columns: ['name', 'email', 'age'], instance_data: {name: 'John', email: 'john@example.com', age: 30} }, 
                expected_output: { methods_created: 3, getter_name: 'John', setter_works: true, dynamic_access: true }
            },
            { 
                input: { columns: ['title', 'price'], instance_data: {title: 'Book', price: 29.99} }, 
                expected_output: { methods_created: 2, getter_title: 'Book', price_formatted: '$29.99' }
            }
        ],
        starter_code: `class DynamicModel
  def initialize(attributes = {})
    # Your code here
  end
  
  def self.define_column(name)
    # Your code here
  end
end

# Usage: 
# User.define_column(:name)
# user = User.new(name: "John")
# user.name # => "John"`,
        expected_solution: `class DynamicModel
  def initialize(attributes = {})
    @attributes = attributes
  end
  
  def self.define_column(name)
    define_method(name) do
      @attributes[name]
    end
    
    define_method("#{name}=") do |value|
      @attributes[name] = value
    end
  end
  
  def method_missing(method_name, *args)
    attr_name = method_name.to_s.gsub('=', '').to_sym
    
    if method_name.to_s.end_with?('=')
      @attributes[attr_name] = args.first
    else
      @attributes[attr_name]
    end
  end
end`
    },
    13: { // Swift
        title: 'Combine Framework Publisher',
        description: 'Build a custom publisher that fetches and transforms data using Combine framework.',
        difficulty_level: 'hard',
        time_limit_minutes: 60,
        test_cases: [
            { input: { url: 'https://api.example.com/data' }, expected_output: 'Data fetched and transformed' }
        ],
        starter_code: `import Foundation
import Combine

class DataFetcher {
    private var cancellables = Set<AnyCancellable>()
    
    func fetchAndTransform(url: URL) -> AnyPublisher<[String], Error> {
        // Your code here
        return Empty().eraseToAnyPublisher()
    }
}`,
        expected_solution: `func fetchAndTransform(url: URL) -> AnyPublisher<[String], Error> {
    return URLSession.shared.dataTaskPublisher(for: url)
        .map { $0.data }
        .decode(type: [String].self, decoder: JSONDecoder())
        .receive(on: DispatchQueue.main)
        .eraseToAnyPublisher()
}`
    },
    14: { // Dart
        title: 'Async Stream Processing',
        description: 'Create a Flutter-ready data stream that handles real-time updates and implements proper error handling.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { input: { events: 'Stream of events' }, expected_output: 'Events processed asynchronously' }
        ],
        starter_code: `import 'dart:async';

class EventProcessor {
  Stream<String> processEvents() async* {
    // Your code here
  }
  
  Future<List<String>> collectEvents(int count) async {
    // Your code here
    return [];
  }
}`,
        expected_solution: `Stream<String> processEvents() async* {
  for (var i = 0; i < 10; i++) {
    await Future.delayed(Duration(milliseconds: 100));
    yield 'Event $i';
  }
}

Future<List<String>> collectEvents(int count) async {
  final events = <String>[];
  await for (final event in processEvents().take(count)) {
    events.add(event);
  }
  return events;
}`
    },
    15: { // Scala
        title: 'Functional Data Transformation',
        description: 'Implement a data pipeline using Scala\'s functional programming features: map, flatMap, filter, and fold.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { input: { data: [1, 2, 3, 4, 5] }, expected_output: 'Transformed using functional operators' }
        ],
        starter_code: `object DataPipeline {
  case class User(id: Int, name: String, age: Int)
  
  def processUsers(users: List[User]): List[String] = {
    // Your code here
    List.empty
  }
  
  def aggregateData(numbers: List[Int]): Map[String, Int] = {
    // Your code here
    Map.empty
  }
}`,
        expected_solution: `def processUsers(users: List[User]): List[String] = {
  users
    .filter(_.age >= 18)
    .map(user => s"\${user.name} (\${user.age})")
    .sorted
}

def aggregateData(numbers: List[Int]): Map[String, Int] = {
  Map(
    "sum" -> numbers.sum,
    "count" -> numbers.length,
    "avg" -> numbers.sum / numbers.length,
    "max" -> numbers.max,
    "min" -> numbers.min
  )
}`
    },
    16: { // TypeScript
        title: 'Advanced Type System',
        description: 'Create a type-safe API client using TypeScript\'s advanced type features: generics, conditional types, and mapped types.',
        difficulty_level: 'hard',
        time_limit_minutes: 65,
        test_cases: [
            { 
                input: { endpoint: '/users', method: 'GET' }, 
                expected_output: { type_safe: true, response_type: 'User[]', no_any_types: true }
            },
            { 
                input: { endpoint: '/users', method: 'POST', body: {name: 'John', email: 'john@test.com'} }, 
                expected_output: { type_safe: true, body_validated: true, response_type: 'User' }
            },
            { 
                input: { endpoint: '/posts', method: 'GET' }, 
                expected_output: { type_safe: true, response_type: 'Post[]' }
            }
        ],
        starter_code: `interface ApiEndpoint {
  '/users': {
    GET: { response: User[] };
    POST: { body: CreateUserDto; response: User };
  };
  '/posts': {
    GET: { response: Post[] };
  };
}

class ApiClient {
  async request<
    Path extends keyof ApiEndpoint,
    Method extends keyof ApiEndpoint[Path]
  >(path: Path, method: Method): Promise<any> {
    // Your code here
    return {} as any;
  }
}`,
        expected_solution: `class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async request<
    Path extends keyof ApiEndpoint,
    Method extends keyof ApiEndpoint[Path]
  >(
    path: Path,
    method: Method,
    body?: ApiEndpoint[Path][Method] extends { body: infer B } ? B : never
  ): Promise<ApiEndpoint[Path][Method] extends { response: infer R } ? R : never> {
    const response = await fetch(\`\${this.baseUrl}\${path}\`, {
      method: method as string,
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
}`
    },
    17: { // PHP
        title: 'Laravel-Style Dependency Injection',
        description: 'Build a simple dependency injection container with automatic resolution and singleton support.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { input: { class: 'UserService' }, expected_output: 'Dependencies auto-resolved' }
        ],
        starter_code: `<?php

class Container {
    private $bindings = [];
    private $instances = [];
    
    public function bind($abstract, $concrete) {
        // Your code here
    }
    
    public function singleton($abstract, $concrete) {
        // Your code here
    }
    
    public function make($abstract) {
        // Your code here
        return null;
    }
}`,
        expected_solution: `public function bind($abstract, $concrete) {
    $this->bindings[$abstract] = [
        'concrete' => $concrete,
        'shared' => false
    ];
}

public function singleton($abstract, $concrete) {
    $this->bindings[$abstract] = [
        'concrete' => $concrete,
        'shared' => true
    ];
}

public function make($abstract) {
    if (isset($this->instances[$abstract])) {
        return $this->instances[$abstract];
    }
    
    $concrete = $this->bindings[$abstract]['concrete'];
    $object = is_callable($concrete) ? $concrete($this) : new $concrete();
    
    if ($this->bindings[$abstract]['shared']) {
        $this->instances[$abstract] = $object;
    }
    
    return $object;
}`
    },
    18: { // R
        title: 'Statistical Data Analysis',
        description: 'Perform comprehensive statistical analysis: calculate descriptive statistics, run hypothesis tests, and create visualizations.',
        difficulty_level: 'medium',
        time_limit_minutes: 60,
        test_cases: [
            { input: { data: 'Dataset with numerical values' }, expected_output: 'Statistical analysis complete' }
        ],
        starter_code: `# Load required libraries
library(ggplot2)

# Function to analyze dataset
analyze_dataset <- function(data) {
  # Your code here
  # Calculate: mean, median, sd, quartiles
  # Perform t-test if applicable
  # Return list of results
}

# Function to visualize data
create_visualization <- function(data) {
  # Your code here
  # Create histogram and boxplot
}`,
        expected_solution: `analyze_dataset <- function(data) {
  results <- list(
    mean = mean(data, na.rm = TRUE),
    median = median(data, na.rm = TRUE),
    sd = sd(data, na.rm = TRUE),
    quartiles = quantile(data, probs = c(0.25, 0.5, 0.75), na.rm = TRUE),
    outliers = boxplot.stats(data)$out
  )
  return(results)
}

create_visualization <- function(data) {
  p1 <- ggplot(data.frame(x = data), aes(x = x)) +
    geom_histogram(bins = 30, fill = "steelblue", alpha = 0.7) +
    theme_minimal()
  
  p2 <- ggplot(data.frame(x = data), aes(y = x)) +
    geom_boxplot(fill = "lightblue") +
    theme_minimal()
  
  return(list(histogram = p1, boxplot = p2))
}`
    },
    21: { // Lua
        title: 'Table Manipulation and Metatables',
        description: 'Create a class system in Lua using metatables with inheritance and method overriding.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { input: { operation: 'Create class with inheritance' }, expected_output: 'OOP working correctly' }
        ],
        starter_code: `-- Create a base class
function Class(base)
    -- Your code here
end

-- Usage:
-- Animal = Class()
-- function Animal:new(name)
-- Dog = Class(Animal)`,
        expected_solution: `function Class(base)
    local class = {}
    class.__index = class
    
    if base then
        setmetatable(class, {__index = base})
    end
    
    function class:new(...)
        local instance = setmetatable({}, class)
        if instance.init then
            instance:init(...)
        end
        return instance
    end
    
    return class
end`
    },
    22: { // Haskell
        title: 'Monadic Parser Combinator',
        description: 'Build a simple parser combinator library using monads to parse and validate JSON-like structures.',
        difficulty_level: 'expert',
        time_limit_minutes: 80,
        test_cases: [
            { input: { text: '{"key": "value"}' }, expected_output: 'Parsed successfully' }
        ],
        starter_code: `module Parser where

import Control.Applicative

newtype Parser a = Parser { runParser :: String -> Maybe (a, String) }

instance Functor Parser where
    fmap = undefined

instance Applicative Parser where
    pure = undefined
    (<*>) = undefined

instance Monad Parser where
    (>>=) = undefined

-- Your parser combinators here
char :: Char -> Parser Char
char = undefined`,
        expected_solution: `instance Functor Parser where
    fmap f (Parser p) = Parser $ \\input -> do
        (x, rest) <- p input
        Just (f x, rest)

instance Applicative Parser where
    pure x = Parser $ \\input -> Just (x, input)
    (Parser pf) <*> (Parser px) = Parser $ \\input -> do
        (f, rest1) <- pf input
        (x, rest2) <- px rest1
        Just (f x, rest2)

instance Monad Parser where
    (Parser p) >>= f = Parser $ \\input -> do
        (x, rest) <- p input
        runParser (f x) rest

char :: Char -> Parser Char
char c = Parser $ \\input ->
    case input of
        (x:xs) | x == c -> Just (c, xs)
        _ -> Nothing`
    },
    23: { // Elixir
        title: 'GenServer State Management',
        description: 'Implement a GenServer that manages a cache with TTL (time-to-live) and automatic cleanup.',
        difficulty_level: 'hard',
        time_limit_minutes: 65,
        test_cases: [
            { input: { key: 'data', ttl: 5000 }, expected_output: 'Cache with TTL working' }
        ],
        starter_code: `defmodule CacheServer do
  use GenServer

  # Client API
  def start_link(opts \\\\ []) do
    # Your code here
  end

  def put(key, value, ttl) do
    # Your code here
  end

  def get(key) do
    # Your code here
  end

  # Server Callbacks
  def init(_opts) do
    # Your code here
  end

  def handle_call({:get, key}, _from, state) do
    # Your code here
  end
end`,
        expected_solution: `def start_link(opts \\\\ []) do
  GenServer.start_link(__MODULE__, opts, name: __MODULE__)
end

def put(key, value, ttl) do
  GenServer.cast(__MODULE__, {:put, key, value, ttl})
end

def get(key) do
  GenServer.call(__MODULE__, {:get, key})
end

def init(_opts) do
  {:ok, %{}}
end

def handle_cast({:put, key, value, ttl}, state) do
  expires_at = System.monotonic_time(:millisecond) + ttl
  Process.send_after(self(), {:expire, key}, ttl)
  {:noreply, Map.put(state, key, {value, expires_at})}
end

def handle_call({:get, key}, _from, state) do
  case Map.get(state, key) do
    {value, expires_at} ->
      if System.monotonic_time(:millisecond) < expires_at do
        {:reply, {:ok, value}, state}
      else
        {:reply, :not_found, Map.delete(state, key)}
      end
    nil ->
      {:reply, :not_found, state}
  end
end`
    },
    24: { // F#
        title: 'Railway Oriented Programming',
        description: 'Implement error handling using the Railway Oriented Programming pattern with Result types.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { input: { data: 'User input' }, expected_output: 'Error handling with Result type' }
        ],
        starter_code: `type Result<'TSuccess, 'TFailure> = 
    | Success of 'TSuccess
    | Failure of 'TFailure

module Result =
    let bind f result =
        // Your code here
        Success ()
    
    let map f result =
        // Your code here
        Success ()

// Example usage
let validateEmail email =
    // Your code here
    Success email`,
        expected_solution: `let bind f result =
    match result with
    | Success x -> f x
    | Failure e -> Failure e

let map f result =
    match result with
    | Success x -> Success (f x)
    | Failure e -> Failure e

let validateEmail email =
    if String.length email > 0 && email.Contains("@") then
        Success email
    else
        Failure "Invalid email"

let validateAge age =
    if age >= 0 && age <= 120 then
        Success age
    else
        Failure "Invalid age"

let createUser email age =
    validateEmail email
    |> Result.bind (fun e ->
        validateAge age
        |> Result.map (fun a -> (e, a)))`
    },
    25: { // Clojure
        title: 'Transducers and Core.async',
        description: 'Implement data processing pipelines using transducers and core.async channels.',
        difficulty_level: 'hard',
        time_limit_minutes: 70,
        test_cases: [
            { input: { data: [1, 2, 3, 4, 5] }, expected_output: 'Processed with transducers' }
        ],
        starter_code: `(ns data-pipeline
  (:require [clojure.core.async :as async]))

(defn process-with-transducer [data]
  ;; Your code here
  )

(defn async-pipeline [input-ch output-ch]
  ;; Your code here
  )`,
        expected_solution: `(defn process-with-transducer [data]
  (into []
        (comp (filter even?)
              (map #(* % %))
              (take 10))
        data))

(defn async-pipeline [input-ch output-ch]
  (async/go-loop []
    (when-let [value (async/<! input-ch)]
      (let [processed (* value 2)]
        (async/>! output-ch processed)
        (recur)))))`
    },
    8: { // Objective-C
        title: 'Memory Management and ARC',
        description: 'Implement a custom object pool with proper memory management under ARC.',
        difficulty_level: 'hard',
        time_limit_minutes: 60,
        test_cases: [
            { input: { operation: 'Pool management' }, expected_output: 'Proper memory handling' }
        ],
        starter_code: `@interface ObjectPool : NSObject

@property (nonatomic, strong) NSMutableArray *availableObjects;
@property (nonatomic, strong) NSMutableArray *inUseObjects;

- (id)obtainObject;
- (void)releaseObject:(id)object;

@end

@implementation ObjectPool

- (instancetype)init {
    // Your code here
}

@end`,
        expected_solution: `- (instancetype)init {
    self = [super init];
    if (self) {
        _availableObjects = [NSMutableArray array];
        _inUseObjects = [NSMutableArray array];
    }
    return self;
}

- (id)obtainObject {
    id object;
    if (self.availableObjects.count > 0) {
        object = [self.availableObjects lastObject];
        [self.availableObjects removeLastObject];
    } else {
        object = [[NSObject alloc] init];
    }
    [self.inUseObjects addObject:object];
    return object;
}

- (void)releaseObject:(id)object {
    [self.inUseObjects removeObject:object];
    [self.availableObjects addObject:object];
}`
    },
    19: { // MATLAB
        title: 'Signal Processing and FFT',
        description: 'Implement signal processing algorithms including FFT analysis and filtering.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { input: { signal: 'Time-domain signal' }, expected_output: 'Frequency analysis complete' }
        ],
        starter_code: `function [frequency_spectrum, filtered_signal] = process_signal(signal, fs)
    % signal: input time-domain signal
    % fs: sampling frequency
    % Your code here
    
    frequency_spectrum = [];
    filtered_signal = [];
end`,
        expected_solution: `function [frequency_spectrum, filtered_signal] = process_signal(signal, fs)
    % Compute FFT
    N = length(signal);
    frequency_spectrum = fft(signal);
    frequencies = (0:N-1) * (fs/N);
    
    % Design low-pass filter
    cutoff = fs / 4;
    [b, a] = butter(4, cutoff/(fs/2), 'low');
    
    % Apply filter
    filtered_signal = filter(b, a, signal);
    
    % Plot results
    figure;
    subplot(2,1,1);
    plot(frequencies(1:N/2), abs(frequency_spectrum(1:N/2)));
    title('Frequency Spectrum');
    
    subplot(2,1,2);
    plot(filtered_signal);
    title('Filtered Signal');
end`
    },
    20: { // Perl
        title: 'Text Processing and Regex',
        description: 'Build a log parser that extracts and analyzes web server logs using advanced regex.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { input: { log: 'Apache access log' }, expected_output: 'Parsed and analyzed' }
        ],
        starter_code: `#!/usr/bin/perl
use strict;
use warnings;

sub parse_log_line {
    my ($line) = @_;
    # Your code here
    # Parse: IP, timestamp, method, path, status, size
}

sub analyze_logs {
    my ($log_file) = @_;
    # Your code here
    # Return statistics: requests per IP, status codes, top paths
}`,
        expected_solution: `sub parse_log_line {
    my ($line) = @_;
    
    if ($line =~ /^(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] "(\\S+) (\\S+) [^"]+" (\\d+) (\\d+)/) {
        return {
            ip => $1,
            timestamp => $2,
            method => $3,
            path => $4,
            status => $5,
            size => $6
        };
    }
    return undef;
}

sub analyze_logs {
    my ($log_file) = @_;
    my %stats = (
        requests_per_ip => {},
        status_codes => {},
        top_paths => {}
    );
    
    open(my $fh, '<', $log_file) or die "Cannot open file: $!";
    
    while (my $line = <$fh>) {
        if (my $entry = parse_log_line($line)) {
            $stats{requests_per_ip}{$entry->{ip}}++;
            $stats{status_codes}{$entry->{status}}++;
            $stats{top_paths}{$entry->{path}}++;
        }
    }
    
    close($fh);
    return \\%stats;
}`
    }
};

// Framework/Technology specific challenges
const frameworkChallenges = {
    26: { // React
        title: 'Custom Hook with useReducer',
        description: 'Build a custom hook for managing complex form state with validation using useReducer.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { 
                input: { fields: {username: '', email: '', password: ''}, validation_rules: {username: 'required', email: 'email', password: 'min:8'} }, 
                expected_output: { values_updated: true, errors_tracked: true, reset_clears_state: true, handle_change_works: true }
            },
            { 
                input: { form_submission: {username: 'john', email: 'invalid', password: '123'} }, 
                expected_output: { validation_errors: ['email', 'password'], form_invalid: true }
            }
        ],
        starter_code: `import { useReducer } from 'react';

function formReducer(state, action) {
  // Your code here
}

export function useForm(initialValues) {
  // Your code here
  
  return {
    values: {},
    errors: {},
    handleChange: () => {},
    handleSubmit: () => {},
    reset: () => {}
  };
}`,
        expected_solution: `function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      };
    case 'RESET':
      return action.initialState;
    default:
      return state;
  }
}

export function useForm(initialValues) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {}
  });
  
  const handleChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };
  
  const reset = () => {
    dispatch({ type: 'RESET', initialState: { values: initialValues, errors: {} } });
  };
  
  return { ...state, handleChange, reset };
}`
    },
    27: { // Vue.js
        title: 'Composable with Reactivity',
        description: 'Create a composable function that manages API calls with loading, error states, and data caching.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { input: { endpoint: '/api/users' }, expected_output: 'API state managed' }
        ],
        starter_code: `import { ref, computed } from 'vue';

export function useApi(url) {
  // Your code here
  
  return {
    data: ref(null),
    loading: ref(false),
    error: ref(null),
    fetch: async () => {},
    refetch: async () => {}
  };
}`,
        expected_solution: `import { ref, computed } from 'vue';

export function useApi(url) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const cache = new Map();
  
  const fetch = async () => {
    if (cache.has(url)) {
      data.value = cache.get(url);
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      data.value = result;
      cache.set(url, result);
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };
  
  return { data, loading, error, fetch, refetch: fetch };
}`
    },
    28: { // Angular
        title: 'Custom RxJS Operator',
        description: 'Create a custom RxJS operator that implements retry logic with exponential backoff.',
        difficulty_level: 'hard',
        time_limit_minutes: 60,
        test_cases: [
            { 
                input: { max_retries: 3, delay_ms: 1000, api_fails: 2 }, 
                expected_output: { retry_attempts: 2, success_on_attempt: 3, total_delay: 3000 }
            },
            { 
                input: { max_retries: 3, delay_ms: 1000, api_fails: 4 }, 
                expected_output: { retry_attempts: 3, final_status: 'error', exponential_backoff: [1000, 2000, 4000] }
            }
        ],
        starter_code: `import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';

export function retryWithBackoff(maxRetries: number = 3, delayMs: number = 1000) {
  return <T>(source: Observable<T>) => {
    // Your code here
  };
}`,
        expected_solution: `export function retryWithBackoff(maxRetries: number = 3, delayMs: number = 1000) {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (index >= maxRetries) {
              return throwError(error);
            }
            const backoffDelay = delayMs * Math.pow(2, index);
            console.log(\`Retry attempt \${index + 1} after \${backoffDelay}ms\`);
            return timer(backoffDelay);
          })
        )
      )
    );
}`
    },
    29: { // Node.js
        title: 'Stream Processing Pipeline',
        description: 'Build a file processing pipeline using Node.js streams for memory-efficient large file handling.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { 
                input: { input_file: 'large-file.txt', lines: 1000, operation: 'toUpperCase' }, 
                expected_output: { output_file: 'output.txt', lines_processed: 1000, memory_efficient: true }
            },
            { 
                input: { input_file: 'data.txt', lines: 500, operation: 'filter_empty' }, 
                expected_output: { empty_lines_removed: true, stream_complete: true }
            }
        ],
        starter_code: `const { Transform } = require('stream');
const fs = require('fs');

class DataTransformer extends Transform {
  _transform(chunk, encoding, callback) {
    // Your code here
  }
}

function processFile(inputPath, outputPath) {
  // Your code here
}`,
        expected_solution: `class DataTransformer extends Transform {
  _transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\\n');
    const transformed = lines
      .filter(line => line.trim())
      .map(line => line.toUpperCase())
      .join('\\n');
    callback(null, transformed + '\\n');
  }
}

function processFile(inputPath, outputPath) {
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);
  const transformer = new DataTransformer();
  
  readStream
    .pipe(transformer)
    .pipe(writeStream)
    .on('finish', () => console.log('Processing complete'));
}`
    },
    32: { // Django
        title: 'Custom Model Manager',
        description: 'Create a custom Django model manager with soft delete functionality and query optimizations.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { input: { operation: 'Soft delete' }, expected_output: 'Manager working correctly' }
        ],
        starter_code: `from django.db import models

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        # Your code here
        pass
    
    def soft_delete(self):
        # Your code here
        pass

class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = SoftDeleteManager()
    
    class Meta:
        abstract = True`,
        expected_solution: `class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        return super().get_queryset().filter(is_deleted=True)

class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = SoftDeleteManager()
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()
    
    class Meta:
        abstract = True`
    },
    33: { // Flask
        title: 'Custom Decorator for API',
        description: 'Build Flask decorators for rate limiting, authentication, and request validation.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { input: { requests: 'Multiple API requests' }, expected_output: 'Rate limited correctly' }
        ],
        starter_code: `from flask import request, jsonify
from functools import wraps
import time

def rate_limit(max_calls=10, time_window=60):
    """Decorator to limit API calls"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Your code here
            pass
        return wrapper
    return decorator

@app.route('/api/data')
@rate_limit(max_calls=5, time_window=60)
def get_data():
    return jsonify({'data': 'value'})`,
        expected_solution: `from collections import defaultdict

call_history = defaultdict(list)

def rate_limit(max_calls=10, time_window=60):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            client_id = request.remote_addr
            current_time = time.time()
            
            # Clean old entries
            call_history[client_id] = [
                t for t in call_history[client_id]
                if current_time - t < time_window
            ]
            
            if len(call_history[client_id]) >= max_calls:
                return jsonify({
                    'error': 'Rate limit exceeded'
                }), 429
            
            call_history[client_id].append(current_time)
            return f(*args, **kwargs)
        return wrapper
    return decorator`
    },
    35: { // Laravel
        title: 'Service Container and Facades',
        description: 'Create a Laravel service with repository pattern and custom facade.',
        difficulty_level: 'medium',
        time_limit_minutes: 60,
        test_cases: [
            { input: { service: 'UserService' }, expected_output: 'Service pattern implemented' }
        ],
        starter_code: `<?php

namespace App\\Services;

use App\\Repositories\\UserRepositoryInterface;

class UserService
{
    protected $userRepository;
    
    public function __construct(UserRepositoryInterface $userRepository)
    {
        // Your code here
    }
    
    public function createUser(array $data)
    {
        // Your code here
    }
}`,
        expected_solution: `class UserService
{
    protected $userRepository;
    
    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }
    
    public function createUser(array $data)
    {
        $validated = validator($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users'
        ])->validate();
        
        return $this->userRepository->create($validated);
    }
    
    public function getUserWithPosts($userId)
    {
        return $this->userRepository->findWithRelations($userId, ['posts']);
    }
}`
    },
    36: { // Ruby on Rails
        title: 'ActiveRecord Scopes and Concerns',
        description: 'Implement reusable ActiveRecord scopes and concerns for common query patterns.',
        difficulty_level: 'medium',
        time_limit_minutes: 50,
        test_cases: [
            { input: { model: 'User' }, expected_output: 'Scopes working correctly' }
        ],
        starter_code: `# app/models/concerns/searchable.rb
module Searchable
  extend ActiveSupport::Concern
  
  included do
    # Your code here
  end
  
  class_methods do
    def search_by(query, fields)
      # Your code here
    end
  end
end`,
        expected_solution: `module Searchable
  extend ActiveSupport::Concern
  
  included do
    scope :active, -> { where(active: true) }
    scope :recent, -> (days = 7) { where('created_at > ?', days.days.ago) }
  end
  
  class_methods do
    def search_by(query, fields)
      return all if query.blank?
      
      conditions = fields.map { |field| "\#{field} LIKE :query" }.join(' OR ')
      where(conditions, query: "%\#{query}%")
    end
    
    def with_associations(*associations)
      includes(*associations).references(*associations)
    end
  end
end`
    },
    37: { // ASP.NET
        title: 'Middleware Pipeline',
        description: 'Create custom ASP.NET Core middleware for logging, error handling, and request transformation.',
        difficulty_level: 'medium',
        time_limit_minutes: 55,
        test_cases: [
            { input: { request: 'HTTP request' }, expected_output: 'Middleware executed' }
        ],
        starter_code: `using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    
    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        // Your code here
    }
}`,
        expected_solution: `public async Task InvokeAsync(HttpContext context)
{
    var startTime = DateTime.UtcNow;
    var requestId = Guid.NewGuid().ToString();
    
    // Log request
    Console.WriteLine($"[{requestId}] {context.Request.Method} {context.Request.Path}");
    
    // Store original body stream
    var originalBodyStream = context.Response.Body;
    
    using (var responseBody = new MemoryStream())
    {
        context.Response.Body = responseBody;
        
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[{requestId}] Error: {ex.Message}");
            throw;
        }
        finally
        {
            var duration = DateTime.UtcNow - startTime;
            Console.WriteLine($"[{requestId}] Completed in {duration.TotalMilliseconds}ms");
            
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }
}`
    },
    38: { // React Native
        title: 'Native Module Bridge',
        description: 'Create a React Native module that bridges to native code for device features.',
        difficulty_level: 'hard',
        time_limit_minutes: 65,
        test_cases: [
            { input: { feature: 'Camera access' }, expected_output: 'Native bridge working' }
        ],
        starter_code: `import { NativeModules, Platform } from 'react-native';

const { DeviceInfo } = NativeModules;

export class DeviceService {
  static async getBatteryLevel() {
    // Your code here
  }
  
  static async getDeviceInfo() {
    // Your code here
  }
}`,
        expected_solution: `const { DeviceInfo } = NativeModules;

export class DeviceService {
  static async getBatteryLevel() {
    try {
      const level = await DeviceInfo.getBatteryLevel();
      return level;
    } catch (error) {
      console.error('Error getting battery level:', error);
      return null;
    }
  }
  
  static async getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isTablet: await DeviceInfo.isTablet(),
      deviceId: await DeviceInfo.getUniqueId()
    };
  }
  
  static addBatteryListener(callback) {
    return DeviceInfo.addListener('BatteryLevelChanged', callback);
  }
}`
    },
    39: { // Flutter
        title: 'Custom Widget with Animation',
        description: 'Build a custom Flutter widget with complex animations and state management.',
        difficulty_level: 'hard',
        time_limit_minutes: 60,
        test_cases: [
            { 
                input: { widget: 'AnimatedCard', child: 'Text Widget', duration_ms: 300 }, 
                expected_output: { has_animation_controller: true, scale_range: [0.8, 1.0], opacity_range: [0.0, 1.0], curve_applied: 'easeOut' }
            },
            { 
                input: { test: 'animation_completion', duration_ms: 300 }, 
                expected_output: { animation_completes: true, final_scale: 1.0, final_opacity: 1.0 }
            }
        ],
        starter_code: `import 'package:flutter/material.dart';

class AnimatedCard extends StatefulWidget {
  final Widget child;
  
  AnimatedCard({required this.child});
  
  @override
  _AnimatedCardState createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<AnimatedCard> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    // Your code here
  }
  
  @override
  Widget build(BuildContext context) {
    // Your code here
    return Container();
  }
}`,
        expected_solution: `class _AnimatedCardState extends State<AnimatedCard> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut)
    );
    
    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn)
    );
    
    _controller.forward();
  }
  
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: widget.child,
          ),
        );
      },
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}`
    }
};

// Combine all challenges
const allChallenges = { ...challengeTemplates, ...frameworkChallenges };

// Main seeder class
class LanguageChallengeSeeder {
    async seedChallenges() {
        console.log('🌱 Starting to seed challenges for languages without challenges...\n');
        
        try {
            // Test connection
            await this.testConnection();
            
            // Get languages without challenges
            const languagesToSeed = await this.getLanguagesWithoutChallenges();
            
            if (languagesToSeed.length === 0) {
                console.log('✅ All languages already have challenges!');
                return;
            }
            
            console.log(`📊 Found ${languagesToSeed.length} languages without challenges\n`);
            
            // Seed challenges
            let successCount = 0;
            let skippedCount = 0;
            
            for (const lang of languagesToSeed) {
                if (allChallenges[lang.id]) {
                    const success = await this.createChallenge(lang.id, allChallenges[lang.id]);
                    if (success) {
                        console.log(`✅ Created challenge for ${lang.name} (ID: ${lang.id})`);
                        successCount++;
                    }
                } else {
                    console.log(`⏭️  No template for ${lang.name} (ID: ${lang.id}) - skipping`);
                    skippedCount++;
                }
            }
            
            console.log(`\n🎉 Seeding completed!`);
            console.log(`✅ Successfully created: ${successCount} challenges`);
            console.log(`⏭️  Skipped: ${skippedCount} languages (no template)`);
            
        } catch (error) {
            console.error('❌ Error during seeding:', error);
            throw error;
        }
    }
    
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('programming_languages')
                .select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            console.log('✅ Supabase connection successful\n');
        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message);
            throw new Error('Cannot connect to Supabase. Check your configuration.');
        }
    }
    
    async getLanguagesWithoutChallenges() {
        // Get all programming languages
        const { data: allLanguages, error: langError } = await supabase
            .from('programming_languages')
            .select('id, name')
            .eq('is_active', true)
            .order('id');
        
        if (langError) {
            console.error('Error fetching languages:', langError);
            return [];
        }
        
        // Get languages that have challenges
        const { data: challengeLanguages, error: chalError } = await supabase
            .from('coding_challenges')
            .select('programming_language_id')
            .eq('is_active', true);
        
        if (chalError) {
            console.error('Error fetching challenges:', chalError);
            return [];
        }
        
        const languageIdsWithChallenges = new Set(
            challengeLanguages.map(c => c.programming_language_id)
        );
        
        // Filter out languages that already have challenges
        return allLanguages.filter(lang => !languageIdsWithChallenges.has(lang.id));
    }
    
    async createChallenge(languageId, template) {
        try {
            const challenge = {
                id: uuidv4(),
                project_id: null, // General challenges, not tied to specific projects
                title: template.title,
                description: template.description,
                difficulty_level: template.difficulty_level,
                time_limit_minutes: template.time_limit_minutes,
                test_cases: JSON.stringify(template.test_cases),
                starter_code: template.starter_code,
                expected_solution: template.expected_solution,
                programming_language_id: languageId,
                created_by: null,
                is_active: true,
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('coding_challenges')
                .insert([challenge])
                .select();
            
            if (error) {
                console.error(`❌ Error creating challenge for language ID ${languageId}:`, error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Exception creating challenge for language ID ${languageId}:`, error);
            return false;
        }
    }
}

// Run the seeder
const seeder = new LanguageChallengeSeeder();

if (require.main === module) {
    seeder.seedChallenges()
        .then(() => {
            console.log('\n✅ Challenge seeding process completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Challenge seeding process failed:', error);
            process.exit(1);
        });
}

module.exports = { LanguageChallengeSeeder };