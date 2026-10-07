package com.Siva.smartskin.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.Siva.smartskin.data.ProductItem
import com.Siva.smartskin.data.ScanResult
import com.Siva.smartskin.data.UserSession
import com.Siva.smartskin.repository.SkinRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val repository = SkinRepository()
    private val auth = FirebaseAuth.getInstance()

    private val _userSession = MutableStateFlow(UserSession())
    val userSession: StateFlow<UserSession> = _userSession.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(auth.currentUser != null)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _scanHistory = MutableStateFlow<List<ScanResult>>(emptyList())
    val scanHistory: StateFlow<List<ScanResult>> = _scanHistory.asStateFlow()

    private val _products = MutableStateFlow<List<ProductItem>>(emptyList())
    val products: StateFlow<List<ProductItem>> = _products.asStateFlow()

    private val _selectedScanResult = MutableStateFlow<ScanResult?>(null)
    val selectedScanResult: StateFlow<ScanResult?> = _selectedScanResult.asStateFlow()

    init {
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            _isLoggedIn.value = user != null
            if (user != null) {
                _userSession.value = UserSession(
                    uid = user.uid,
                    email = user.email ?: "",
                    displayName = user.displayName ?: user.email?.substringBefore("@") ?: "SkinCare User"
                )
                observeUserData(user.uid)
            } else {
                _userSession.value = UserSession()
                _scanHistory.value = emptyList()
            }
        }

        observeProducts()
    }

    private fun observeUserData(userId: String) {
        viewModelScope.launch {
            repository.getUserScans(userId).collect { scans ->
                _scanHistory.value = scans
            }
        }
    }

    private fun observeProducts() {
        viewModelScope.launch {
            repository.getGlobalProducts().collect { items ->
                _products.value = items
            }
        }
    }

    fun selectScanResult(result: ScanResult) {
        _selectedScanResult.value = result
    }

    fun logout() {
        auth.signOut()
    }
}
