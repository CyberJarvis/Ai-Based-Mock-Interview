# Sample Formatted Interview Questions

Here are examples of how the enhanced markdown formatting makes technical interview questions much more readable and professional:

## 1. File Path Simplification Problem

### Question:
## Backend Path Processing Challenge

You are building a backend service in **Node.js** or **Python** that needs to process file paths. Given an absolute Unix-style path, such as `/a/./b/../../c/`, write a function that simplifies it. 

**Requirements:**
- Remove `.` (current directory) components
- Remove `..` (parent directory) components  
- Result in a canonical path
- Handle multiple `/` as single slash
- Root directory `/` should remain `/`

**Example:** `/a/./b/../../c/` should become `/c/`

### Answer:
### Solution Approach

**🔧 Algorithm: Stack-Based Path Resolution**

**Key Steps:**
1. **Split the path:** Split input by `/` to get components
2. **Initialize stack:** Use empty array as stack
3. **Process components:**
   - If component is `.` or empty → ignore it
   - If component is `..` → pop from stack (if not empty)
   - Otherwise → push component onto stack
4. **Build result:** Join stack with `/` and prepend `/`

**💻 Node.js Implementation:**
```javascript
function simplifyPath(path) {
    const stack = [];
    const components = path.split('/');
    
    for (const comp of components) {
        if (comp === '' || comp === '.') {
            continue;
        } else if (comp === '..') {
            if (stack.length > 0) {
                stack.pop();
            }
        } else {
            stack.push(comp);
        }
    }
    
    return stack.length === 0 ? '/' : '/' + stack.join('/');
}
```

**🐍 Python Implementation:**
```python
def simplify_path(path: str) -> str:
    stack = []
    components = path.split('/')
    
    for comp in components:
        if comp == '' or comp == '.':
            continue
        elif comp == '..':
            if stack:
                stack.pop()
        else:
            stack.append(comp)
    
    return "/" if not stack else "/" + "/".join(stack)
```

**✅ Test Cases:**
- `simplifyPath("/home/")` → `"/home"`
- `simplifyPath("/../")` → `"/"`  
- `simplifyPath("/home//foo/")` → `"/home/foo"`
- `simplifyPath("/a/./b/../../c/")` → `"/c"`

---

## 2. Activity Burst Detection

### Question:
## User Activity Aggregation

You're working on a feature in a **Node.js** or **Python** backend that aggregates user activity. Given a stream of `activity_log` entries, where each entry is an object like:

```javascript
{ user_id: 'abc', timestamp: 1678886400000, action: 'login' }
```

**Objective:** Identify and group 'bursts' of activity.

**Burst Definition:** A sequence of activities by the *same* `user_id` where each consecutive activity is within a **1-minute (60,000ms) window** of the previous activity.

**Return:** List of arrays, where each inner array represents a burst of activity for a specific user.

*Note: Input `activity_log` is already sorted by `timestamp`.*

### Answer:
### Solution Strategy

**🎯 Algorithm: Sliding Window with User Grouping**

**💻 Implementation:**
```javascript
function identifyActivityBursts(activityLog) {
    const bursts = [];
    const userLastActivity = new Map();
    const userCurrentBurst = new Map();
    
    for (const activity of activityLog) {
        const { user_id, timestamp } = activity;
        const lastTimestamp = userLastActivity.get(user_id);
        
        // Check if this continues a burst (within 1 minute)
        if (lastTimestamp && (timestamp - lastTimestamp <= 60000)) {
            // Continue current burst
            userCurrentBurst.get(user_id).push(activity);
        } else {
            // End previous burst if exists
            if (userCurrentBurst.has(user_id)) {
                bursts.push([...userCurrentBurst.get(user_id)]);
            }
            // Start new burst
            userCurrentBurst.set(user_id, [activity]);
        }
        
        userLastActivity.set(user_id, timestamp);
    }
    
    // Add remaining bursts
    for (const burst of userCurrentBurst.values()) {
        if (burst.length > 0) {
            bursts.push(burst);
        }
    }
    
    return bursts;
}
```

**🔍 Key Considerations:**
- **Time Window:** 60,000ms = 1 minute
- **User Isolation:** Each user's bursts are independent
- **Burst Completion:** When gap > 1 minute or new user activity
- **Memory Efficiency:** Track only current burst per user

---

## 3. E-commerce Customer Query

### Question:
## Database Schema Design Challenge

You are designing a database schema for an **e-commerce platform** using **MySQL**. 

**Tables:**
- `Customers` (customer_id, name, email)
- `Orders` (order_id, customer_id, order_date, total_amount, status)

**Query Requirement:** Identify customers who have:
✅ Placed an order in the **last 30 days**  
❌ **Never** ordered a product with `total_amount` > **$500**

**Return:** `name` and `email` of these customers  
**Use:** `NOW()` for current date

### Answer:
### SQL Solution

**🗄️ Query Strategy:**
```sql
SELECT DISTINCT c.name, c.email
FROM Customers c
WHERE c.customer_id IN (
    -- Customers with orders in last 30 days
    SELECT o1.customer_id 
    FROM Orders o1 
    WHERE o1.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
)
AND c.customer_id NOT IN (
    -- Customers who have ever ordered > $500
    SELECT o2.customer_id 
    FROM Orders o2 
    WHERE o2.total_amount > 500
);
```

**🔄 Alternative with JOIN:**
```sql
SELECT DISTINCT c.name, c.email
FROM Customers c
INNER JOIN Orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
AND c.customer_id NOT IN (
    SELECT customer_id 
    FROM Orders 
    WHERE total_amount > 500
);
```

**📊 Query Breakdown:**
1. **Recent Activity Filter:** `DATE_SUB(NOW(), INTERVAL 30 DAY)`
2. **Exclusion Logic:** `NOT IN` for customers with high-value orders
3. **Distinct Results:** Prevent duplicate customer records

---

## 4. JavaScript Debounce Function

### Question:
## Efficient User Input Handling

In a **React** or **Angular** application, you need to handle user input efficiently (e.g., search bar). Instead of making an API call on every keystroke, implement a **debounce function**.

**Requirements:**
- Takes function (`func`) and `delay` (milliseconds) as arguments
- Returns a *new* function
- Executes `func` only after `delay` ms since *last* invocation
- Cancels previous execution if called again within delay

### Answer:
### Debounce Implementation

**⚡ Core Concept:** Delay execution until activity stops

**💻 JavaScript Implementation:**
```javascript
function debounce(func, delay) {
    let timeoutId;
    
    return function debounced(...args) {
        // Clear previous timeout
        clearTimeout(timeoutId);
        
        // Set new timeout
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
```

**🎯 Usage Example:**
```javascript
// Search API call function
const searchAPI = (query) => {
    console.log(`Searching for: ${query}`);
    // Make API call here
};

// Create debounced version (300ms delay)
const debouncedSearch = debounce(searchAPI, 300);

// React component usage
function SearchComponent() {
    const handleInputChange = (event) => {
        debouncedSearch(event.target.value);
    };
    
    return (
        <input 
            type="text" 
            onChange={handleInputChange}
            placeholder="Search..."
        />
    );
}
```

**🔧 Advanced Version with Cancel:**
```javascript
function debounce(func, delay) {
    let timeoutId;
    
    const debounced = function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
    
    // Add cancel method
    debounced.cancel = () => clearTimeout(timeoutId);
    
    return debounced;
}
```

---

## 5. REST API Even/Odd Sum Endpoint

### Question:
## API Design Challenge

Implement a **REST API endpoint** in **Node.js (Express)** or **Python (Flask/FastAPI)** that:

**Input:** List of integers from client  
**Operations:** 
- Calculate sum of all **even** numbers
- Calculate sum of all **odd** numbers  
**Output:** Single JSON response with both sums

**Requirements:**
- Define HTTP method, URL path, request/response format
- Include error handling for non-array or non-numeric inputs
- Provide server-side implementation

### Answer:
### API Design & Implementation

**🌐 Endpoint Specification:**
- **Method:** `POST`
- **Path:** `/api/numbers/sum`
- **Content-Type:** `application/json`

**📥 Request Format:**
```json
{
    "numbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

**📤 Response Format:**
```json
{
    "success": true,
    "data": {
        "evenSum": 30,
        "oddSum": 25,
        "totalCount": 10,
        "evenCount": 5,
        "oddCount": 5
    }
}
```

**💻 Node.js (Express) Implementation:**
```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/numbers/sum', (req, res) => {
    try {
        const { numbers } = req.body;
        
        // Validation
        if (!Array.isArray(numbers)) {
            return res.status(400).json({
                success: false,
                error: 'Input must be an array of numbers'
            });
        }
        
        if (numbers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array cannot be empty'
            });
        }
        
        let evenSum = 0;
        let oddSum = 0;
        let evenCount = 0;
        let oddCount = 0;
        
        for (const num of numbers) {
            if (typeof num !== 'number' || !Number.isInteger(num)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid number: ${num}. All elements must be integers.`
                });
            }
            
            if (num % 2 === 0) {
                evenSum += num;
                evenCount++;
            } else {
                oddSum += num;
                oddCount++;
            }
        }
        
        res.json({
            success: true,
            data: {
                evenSum,
                oddSum,
                totalCount: numbers.length,
                evenCount,
                oddCount
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

**🐍 Python (FastAPI) Implementation:**
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class NumbersRequest(BaseModel):
    numbers: List[int]

class SumResponse(BaseModel):
    success: bool
    data: dict

@app.post("/api/numbers/sum", response_model=SumResponse)
async def calculate_sums(request: NumbersRequest):
    try:
        numbers = request.numbers
        
        if not numbers:
            raise HTTPException(status_code=400, detail="Array cannot be empty")
        
        even_sum = sum(num for num in numbers if num % 2 == 0)
        odd_sum = sum(num for num in numbers if num % 2 != 0)
        even_count = sum(1 for num in numbers if num % 2 == 0)
        odd_count = sum(1 for num in numbers if num % 2 != 0)
        
        return SumResponse(
            success=True,
            data={
                "evenSum": even_sum,
                "oddSum": odd_sum,
                "totalCount": len(numbers),
                "evenCount": even_count,
                "oddCount": odd_count
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

**🔧 Error Handling:**
- **400 Bad Request:** Invalid input format
- **422 Unprocessable Entity:** Type validation errors  
- **500 Internal Server Error:** Unexpected server errors

**✅ Test Cases:**
```bash
# Valid request
curl -X POST http://localhost:3000/api/numbers/sum \
  -H "Content-Type: application/json" \
  -d '{"numbers": [1,2,3,4,5,6]}'

# Invalid request (non-array)
curl -X POST http://localhost:3000/api/numbers/sum \
  -H "Content-Type: application/json" \
  -d '{"numbers": "invalid"}'
```